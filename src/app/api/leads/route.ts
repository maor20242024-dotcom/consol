import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";
import { LEAD_SOURCES, DEFAULT_LEAD_SOURCE, isValidLeadSource } from "@/lib/lead-sources";

/**
 * Smart Lead Scoring Algorithm
 * Replaces random scoring (70-99) with intelligent evaluation
 */
function calculateLeadScore(leadData: {
  name: string;
  email?: string;
  phone?: string;
  budget?: string;
  source?: string;
}): number {
  let score = 0;

  // Budget scoring (30 points max)
  if (leadData.budget) {
    const budget = parseFloat(leadData.budget.replace(/[^0-9.]/g, ''));
    if (budget > 2000000) score += 30;
    else if (budget > 1000000) score += 20;
    else if (budget > 500000) score += 10;
    else if (budget > 100000) score += 5;
  }

  // Source scoring (25 points max) - Updated with new sources
  const sourceScores: Record<string, number> = {
    [LEAD_SOURCES.INSTAGRAM_AD]: 25,
    [LEAD_SOURCES.REFERRAL]: 20,
    [LEAD_SOURCES.WEBSITE_FORM]: 18,
    [LEAD_SOURCES.INSTAGRAM_DM]: 15,
    [LEAD_SOURCES.WHATSAPP]: 15,
    [LEAD_SOURCES.WEBSITE_ADS]: 12,
    [LEAD_SOURCES.PHONE_CALL]: 10,
    [LEAD_SOURCES.MANUAL]: 8
  };
  score += sourceScores[leadData.source || ''] || 5;

  // Data completeness (20 points max)
  if (leadData.email && leadData.phone) score += 20;
  else if (leadData.email || leadData.phone) score += 10;

  // Name quality (15 points max) - checking if it's a real name
  if (leadData.name && leadData.name.length > 3 && leadData.name.includes(' ')) {
    score += 15;
  } else if (leadData.name && leadData.name.length > 2) {
    score += 8;
  }

  // Email domain quality (10 points max)
  if (leadData.email) {
    const domain = leadData.email.split('@')[1]?.toLowerCase();
    const businessDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];
    if (!businessDomains.includes(domain || '')) {
      score += 10; // Business email
    } else {
      score += 5; // Personal email
    }
  }

  return Math.min(score, 100);
}

export async function POST(req: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    let auth;
    try {
      auth = await requireAuth(req);
    } catch (authError) {
      console.error('[LEADS API] Authentication failed:', authError);
      return NextResponse.json({ 
        error: 'Unauthorized access' 
      }, { status: 401 });
    }

    const { name, phone, email, budget, source, campaignId } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // 🎯 NEW: Validate and normalize source
    const normalizedSource = source && isValidLeadSource(source) ? source : DEFAULT_LEAD_SOURCE;

    // 🔒 SECURITY: Verify campaign ownership if campaignId is provided
    if (campaignId) {
      const supabase = createAdminClient();
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, name, created_by')
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaign) {
        return NextResponse.json({ 
          error: 'Campaign not found' 
        }, { status: 404 });
      }

      // Check if user owns the campaign or is admin
      if (campaign.created_by !== auth.userId && !auth.email?.includes('admin')) {
        return NextResponse.json({ 
          error: 'Access denied - You can only use your own campaigns' 
        }, { status: 403 });
      }
    }

    // 🧠 SMART SCORING: Use intelligent algorithm instead of random
    const leadData = { name, email, phone, budget, source: normalizedSource };
    const score = calculateLeadScore(leadData);

    const supabase = createAdminClient();
    const { data: lead, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          phone,
          email: email ?? null,
          budget: budget ?? null,
          source: normalizedSource, // 🎯 NEW: Normalized source
          campaign_id: campaignId || null, // 🎯 NEW: Link to campaign
          status: 'new',
          score: score, // 🧠 Smart scoring instead of random
          assignedTo: auth.userId, // 🔒 SECURITY: Assign to authenticated user
          createdBy: auth.userId // Track who created the lead
        }
      ])
      .select(`
        *,
        campaign:campaign_id (
          id,
          name,
          status,
          platform
        )
      `)
      .single();

    if (error) {
      console.error('[LEADS API] Database error:', error);
      return NextResponse.json({ error: error.message ?? 'Failed to insert lead' }, { status: 500 });
    }

    console.log('[LEADS API] Lead created successfully:', {
      leadId: lead.id,
      score: score,
      source: normalizedSource,
      campaignId: campaignId,
      createdBy: auth.userId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      lead,
      scoringBreakdown: {
        score,
        method: 'intelligent',
        factors: {
          budget: leadData.budget ? 'calculated' : 'not_provided',
          source: normalizedSource,
          completeness: (email && phone) ? 'full' : 'partial',
          nameQuality: name.includes(' ') ? 'full' : 'basic'
        }
      }
    });
  } catch (error) {
    console.error('[LEADS API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve leads (with filtering and pagination)
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    const auth = await requireAuth(req);
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const stage = searchParams.get('stage');
    const source = searchParams.get('source');
    const campaignId = searchParams.get('campaignId'); // 🎯 NEW: Filter by campaign

    const supabase = createAdminClient();
    let query = supabase
      .from('leads')
      .select(`
        *,
        stage:stageId (
          id,
          name,
          color,
          order
        ),
        campaign:campaign_id (
          id,
          name,
          status,
          platform
        )
      `)
      .eq('assignedTo', auth.userId) // 🔒 SECURITY: Only user's leads
      .order('createdAt', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters
    if (stage) {
      query = query.eq('stageId', stage);
    }
    if (source) {
      query = query.eq('source', source);
    }
    if (campaignId) {
      query = query.eq('campaign_id', campaignId); // 🎯 NEW: Campaign filter
    }

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('[LEADS API] Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('[LEADS API] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
