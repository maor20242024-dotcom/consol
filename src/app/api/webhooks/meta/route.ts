import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/meta-client';
import { extractInstagramMessages } from '@/lib/meta/instagram';
import { env } from '@/lib/env';
import { metaWebhook, error } from '@/lib/logger';
import { prisma } from '@/lib/db';

/**
 * Meta Webhook Handler
 * Handles Instagram and WhatsApp webhooks in unified endpoint
 */

// Webhook verification for Meta
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    metaWebhook('Webhook verification attempt', {
      mode,
      hasToken: !!token,
      hasChallenge: !!challenge
    });

    // Verify webhook
    if (mode === 'subscribe' && token === 'imperiumgate_meta_verify_2024') {
      metaWebhook('Webhook verification successful');
      return new NextResponse(challenge);
    }

    metaWebhook('Webhook verification failed', {
      expectedToken: env.META_WEBHOOK_VERIFY_TOKEN,
      receivedToken: token,
      mode
    });

    return NextResponse.json({ error: 'Invalid verification' }, { status: 403 });
  } catch (err) {
    error('Webhook verification error', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

// Handle incoming webhook events
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-hub-signature-256');
    const contentType = req.headers.get('content-type');

    metaWebhook('Incoming webhook request', {
      hasSignature: !!signature,
      contentType,
      bodyLength: body.length
    });

    // Verify webhook signature
    // In dev mode/without signature secret, we might skip verification or warn
    if (process.env.NODE_ENV === 'production' && (!signature || !verifyWebhookSignature(body, signature))) {
      error('Invalid webhook signature', {
        hasSignature: !!signature,
        signatureLength: signature?.length
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Parse JSON safely
    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      error('JSON parsing error', parseError);
      metaWebhook('Raw body received', body.substring(0, 500));
      return NextResponse.json({ success: true }); // Always return 200
    }

    metaWebhook('Webhook payload received', {
      object: data.object,
      entryCount: data.entry?.length
    });

    // Handle Instagram messages
    if (data.object === 'instagram') {
      const messages = extractInstagramMessages(data);
      metaWebhook(`Processing ${messages.length} Instagram messages`);

      // Store messages in database
      // Use imported prisma client
      try {
        for (const message of messages) {
          metaWebhook('Processing Instagram message', {
            senderId: message.sender.id,
            hasText: !!message.message?.text,
            timestamp: message.timestamp
          });

          // Find or get account ID if needed. For now assuming normalized structure or we need to lookup account by sender/recipient
          // Assuming recipient.id is our account ID usually for incoming messages
          const igAccount = await prisma.instagramAccount.findFirst({
            where: { instagramUserId: message.recipient.id }
          });

          // Store in instagram_messages table
          await prisma.instagramMessage.create({
            data: {
              senderId: message.sender.id,
              recipientId: message.recipient.id,
              message: message.message?.text || '',
              timestamp: new Date(message.timestamp),
              messageId: message.message?.mid || `msg_${Date.now()}`,
              isFromUser: false,
              direction: 'incoming',
              instagramAccountId: igAccount?.id
            }
          });

          metaWebhook('Stored Instagram message in database');

          // --- AUTO-REPLY LOGIC ---
          // Only reply if there is text and it's a new message (not an echo)
          // Also check if "Agent Bot" is enabled for this account (assuming yes for now)
          // @ts-ignore - is_echo might exist on the raw message object but not in our simplified type
          if (message.message?.text && !message.message.is_echo) {
            try {
              const { generateAIResponse, SYSTEM_PROMPTS } = await import('@/lib/ai-assistant');
              const { sendInstagramMessage } = await import('@/lib/meta-client');

              // 1. Get Conversation History (Last 5 messages) to provide context
              // Simplified: for now just reply to the current message
              // Ideally: fetch previous messages from DB

              const systemPrompt = SYSTEM_PROMPTS['instagram']['en']; // Default to English for now, or detect
              const chatMessages = [
                { role: 'system' as const, content: systemPrompt },
                { role: 'user' as const, content: message.message.text }
              ];

              // 2. Generate Reply
              const aiReply = await generateAIResponse(chatMessages, 'instagram');

              if (aiReply) {
                metaWebhook('Generated AI Reply', { length: aiReply.length });

                // 3. Send Reply via Instagram API
                // Need access token. Using stored account info
                if (igAccount?.accessToken) {
                  await sendInstagramMessage({
                    recipientId: message.sender.id, // Reply to sender
                    message: aiReply,
                    accessToken: igAccount.accessToken
                  });

                  // 4. Store Reply in DB
                  await prisma.instagramMessage.create({
                    data: {
                      senderId: message.recipient.id, // We are sender
                      recipientId: message.sender.id,
                      message: aiReply,
                      timestamp: new Date(),
                      messageId: `reply_${Date.now()}`,
                      isFromUser: true, // System generated
                      direction: 'outgoing',
                      instagramAccountId: igAccount.id
                    }
                  });
                  metaWebhook('Sent and stored AI reply');
                }
              }
            } catch (aiError) {
              error('AI Auto-Reply Failed', aiError);
            }
          }
        }
      } catch (dbError) {
        error('Failed to store Instagram messages', dbError);
      }
    }

    // Handle WhatsApp messages
    if (data.entry?.[0]?.changes?.[0]?.field === 'messages') {
      const whatsappData = data.entry[0].changes[0].value;
      metaWebhook('WhatsApp message received', {
        phoneNumber: whatsappData.messages?.[0]?.from,
        hasText: !!whatsappData.messages?.[0]?.text?.body
      });

      // Store WhatsApp messages in database
      try {
        const metadata = whatsappData.metadata;
        const phoneNumberId = metadata?.phone_number_id;

        // Find the WhatsApp account associated with this phone number ID
        const waAccount = await prisma.whatsappAccount.findUnique({
          where: { phoneNumberId: phoneNumberId || '' }
        });

        if (whatsappData.messages) {
          for (const message of whatsappData.messages) {
            const isText = message.type === 'text';
            const messageBody = isText ? message.text.body : `[${message.type.toUpperCase()}]`;

            await prisma.whatsappMessage.create({
              data: {
                senderId: message.from, // The user's phone number
                recipientId: phoneNumberId, // Our business phone number ID
                phoneNumber: message.from,
                message: messageBody,
                timestamp: new Date(parseInt(message.timestamp) * 1000),
                messageId: message.id,
                isFromUser: true,
                direction: 'INBOUND',
                whatsappAccountId: waAccount?.id
              }
            });

            metaWebhook('Stored WhatsApp message in database', { messageId: message.id });
          }
        }
      } catch (dbError) {
        error('Failed to store WhatsApp messages', dbError);
      }
    }

    // Always return 200 to Meta
    return NextResponse.json({ success: true });

  } catch (err) {
    error('Webhook processing error', err);
    // Always return 200 to Meta to prevent retries
    return NextResponse.json({ success: true });
  }
}
