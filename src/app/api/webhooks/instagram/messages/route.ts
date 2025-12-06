import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyWebhookSignature } from '@/lib/webhook-verification';

// Types for Instagram webhook payload
interface InstagramWebhookPayload {
  object: 'page';
  entry: Array<{
    id: string;
    time: number;
    messaging: Array<{
      sender: {
        id: string;
      name?: string;
      username?: string;
      profile_pic?: string;
      profile_pic_url?: string;
      phone_number?: string;
      is_user: boolean;
      referral?: {
        ref: string;
        source: string;
        type: string;
        ad_id?: string;
      };
    };
      recipient: {
        id: string;
        username?: string;
        phone_number?: string;
      };
      timestamp: number;
      message?: {
        mid: string;
        text: string;
        attachments?: Array<{
          type: string;
          payload: {
            url: string;
          };
        }>;
      };
      postback?: {
        payload: string;
        title: string;
      };
      delivery?: {
        mids: string[];
        watermark: number;
        seq: number;
      };
      read?: {
        watermark: number;
        seq: number;
      };
      optin?: {
        ref: string;
        source: string;
        type: string;
      } | {
        user_ref: string;
        source: string;
        type: string;
        ad_id: string;
      };
    }>;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    // Verify webhook signature
    if (!signature || !verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: InstagramWebhookPayload = JSON.parse(body);
    
    // Handle webhook verification (GET request)
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
        return new NextResponse(challenge);
      }
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Process messages
    for (const entry of payload.entry) {
      for (const messaging of entry.messaging) {
        // Only process messages from users
        if (!messaging.message || messaging.sender.is_user === false) {
          continue;
        }

        await processInstagramMessage(messaging);
      }
    }

    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processInstagramMessage(messaging: any) {
  const supabase = createAdminClient();
  
  try {
    const { sender, recipient, message, timestamp, referral } = messaging;
    
    // Check if this message is from an ad campaign
    let campaignId = null;
    if (referral && referral.ad_id) {
      // Try to find campaign by external ID
      const { data: campaign } = await supabase
        .from('Campaign')
        .select('id')
        .eq('externalId', referral.ad_id)
        .single();
      
      if (campaign) {
        campaignId = campaign.id;
      }
    }

    // Check if sender is already a lead
    const { data: existingLead } = await supabase
      .from('Lead')
      .select('id, name, email, phone')
      .eq('source', 'INSTAGRAM_DM')
      .or(`email.eq.${sender.username},phone.eq.${sender.username}`)
      .single();

    let leadId = null;
    
    if (existingLead) {
      leadId = existingLead.id;
      
      // Update last activity
      await supabase
        .from('Activity')
        .insert({
          leadId: existingLead.id,
          type: 'INSTAGRAM',
          content: message?.text || '',
          performedBy: 'System',
        });
    } else {
      // Create new lead
      const { data: newLead } = await supabase
        .from('Lead')
        .insert({
          name: sender.name || sender.username || 'Instagram User',
          email: `${sender.username}@instagram.com`,
          phone: sender.phone_number || null,
          source: 'INSTAGRAM_DM',
          campaignId,
          status: 'new',
          score: 70, // Default score for Instagram leads
          priority: 'HIGH', // Instagram DMs are high priority
        })
        .select('id')
        .single();

      leadId = newLead?.id;

      // Create initial activity
      if (newLead?.id) {
        await supabase
          .from('Activity')
          .insert({
            leadId: newLead.id,
            type: 'INSTAGRAM',
            content: message?.text || '',
            performedBy: 'System',
          });
      }
    }

    // Store Instagram message
    await supabase
      .from('InstagramMessage')
      .insert({
        senderId: sender.id,
        username: sender.username,
        message: message?.text || '',
        timestamp: new Date(timestamp * 1000), // Convert to milliseconds
        profilePictureUrl: sender.profile_pic || sender.profile_pic_url,
        messageId: message?.mid || `msg_${timestamp}`,
        isFromUser: true,
        leadId,
        campaignId,
      });

    // If there's a referral from an ad, update campaign performance
    if (campaignId) {
      await updateCampaignMetrics(campaignId);
    }

  } catch (error) {
    console.error('Error processing Instagram message:', error);
    throw error;
  }
}

async function updateCampaignMetrics(campaignId: string) {
  const supabase = createAdminClient();
  
  try {
    // Update campaign metrics (simplified - in real implementation, you'd track actual spend)
    await supabase
      .from('Campaign')
      .update({
        status: 'ACTIVE',
        // In a real implementation, you'd update these with actual values from Meta API
      })
      .eq('id', campaignId);

  } catch (error) {
    console.error('Error updating campaign metrics:', error);
  }
}

// GET handler for webhook verification
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
}
