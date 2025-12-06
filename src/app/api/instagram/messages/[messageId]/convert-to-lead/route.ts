import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// POST: Convert Instagram message to lead
export async function POST(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params;
    const supabase = createAdminClient();

    // Get the Instagram message
    const { data: message, error: messageError } = await supabase
      .from('InstagramMessage')
      .select('*')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if already converted
    if (message.leadId) {
      return NextResponse.json(
        { success: false, error: 'Message already converted to lead' },
        { status: 400 }
      );
    }

    // Check if lead already exists for this sender
    const { data: existingLead } = await supabase
      .from('Lead')
      .select('id')
      .eq('source', 'INSTAGRAM_DM')
      .or(`email.eq.${message.username}@instagram.com,senderId.eq.${message.senderId}`)
      .single();

    let leadId: string;

    if (existingLead) {
      leadId = existingLead.id;
      
      // Update the message with existing lead
      await supabase
        .from('InstagramMessage')
        .update({ leadId })
        .eq('id', messageId);

      // Add activity
      await supabase
        .from('Activity')
        .insert({
          leadId,
          type: 'INSTAGRAM',
          content: message.message,
          performedBy: 'System',
        });

    } else {
      // Create new lead
      const { data: newLead, error: createError } = await supabase
        .from('Lead')
        .insert({
          name: message.username || 'Instagram User',
          email: `${message.username}@instagram.com`,
          phone: null,
          source: 'INSTAGRAM_DM',
          campaignId: message.campaignId,
          status: 'new',
          score: 75, // Higher score for converted messages
          priority: 'HIGH',
        })
        .select('id, name, email, phone, status, priority')
        .single();

      if (createError || !newLead) {
        return NextResponse.json(
          { success: false, error: 'Failed to create lead' },
          { status: 500 }
        );
      }

      leadId = newLead.id;

      // Update the message with new lead
      await supabase
        .from('InstagramMessage')
        .update({ leadId })
        .eq('id', messageId);

      // Add initial activity
      await supabase
        .from('Activity')
        .insert({
          leadId,
          type: 'INSTAGRAM',
          content: message.message,
          performedBy: 'System',
        });
    }

    // Fetch updated lead data
    const { data: leadData } = await supabase
      .from('Lead')
      .select('id, name, email, phone, status, priority')
      .eq('id', leadId)
      .single();

    return NextResponse.json({
      success: true,
      leadId,
      lead: leadData
    });

  } catch (error) {
    console.error('Convert to lead error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
