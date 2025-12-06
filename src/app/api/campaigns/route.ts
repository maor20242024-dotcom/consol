import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    const auth = await requireAuth(req, { allowAnonymous: true });
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    let query = supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (platform) {
      query = query.eq('platform', platform);
    }

    // Apply pagination
    const startRow = (page - 1) * limit;
    query = query.range(startRow, startRow + limit - 1);

    const { data: campaigns, error, count } = await query;

    if (error) {
      console.error('[CAMPAIGNS API] Fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('[CAMPAIGNS API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    const auth = await requireAuth(req);

    const { 
      name, 
      status = "DRAFT", 
      objective, 
      budget, 
      startDate, 
      endDate, 
      platform = "FACEBOOK",
      externalId 
    } = await req.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Campaign name is required'
      }, { status: 400 });
    }

    // 🔒 SECURITY: Add creator tracking
    const campaignData = {
      name,
      status,
      objective,
      budget,
      start_date: startDate,
      end_date: endDate,
      platform,
      external_id: externalId,
      created_by: auth.userId, // Track who created the campaign
      created_at: new Date().toISOString()
    };

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (error) {
      console.error('[CAMPAIGNS API] Create error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 });
    }

    console.log('[CAMPAIGNS API] Campaign created:', {
      campaignId: campaign.id,
      name: campaign.name,
      createdBy: auth.userId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('[CAMPAIGNS API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    const auth = await requireAuth(req);

    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Campaign ID is required'
      }, { status: 400 });
    }

    // 🔒 SECURITY: Verify user can update this campaign
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingCampaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 });
    }

    // 🔒 SECURITY: Only allow creator or admin to update
    if (existingCampaign.created_by !== auth.userId && !auth.email?.includes('admin')) {
      return NextResponse.json({
        success: false,
        error: 'Access denied - You can only update your own campaigns'
      }, { status: 403 });
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: auth.userId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[CAMPAIGNS API] Update error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 });
    }

    console.log('[CAMPAIGNS API] Campaign updated:', {
      campaignId: id,
      updatedBy: auth.userId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('[CAMPAIGNS API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    const auth = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Campaign ID is required'
      }, { status: 400 });
    }

    // 🔒 SECURITY: Verify user can delete this campaign
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingCampaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 });
    }

    // 🔒 SECURITY: Only allow creator or admin to delete
    if (existingCampaign.created_by !== auth.userId && !auth.email?.includes('admin')) {
      return NextResponse.json({
        success: false,
        error: 'Access denied - You can only delete your own campaigns'
      }, { status: 403 });
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[CAMPAIGNS API] Delete error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 });
    }

    console.log('[CAMPAIGNS API] Campaign deleted:', {
      campaignId: id,
      deletedBy: auth.userId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('[CAMPAIGNS API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
