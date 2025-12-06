import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET: Fetch Instagram messages
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    const { data: messages, error } = await supabase
      .from('InstagramMessage')
      .select(`
        *,
        lead: Lead(
          id,
          name,
          email,
          phone,
          status,
          priority
        ),
        campaign: Campaign(
          id,
          name,
          status
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching Instagram messages:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    });

  } catch (error) {
    console.error('Instagram messages API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
