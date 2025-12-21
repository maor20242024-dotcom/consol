import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/meta-client';
import { extractInstagramMessages } from '@/lib/meta/instagram';
import { env } from '@/lib/env';
import { metaWebhook, error } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { generateAIResponse, SYSTEM_PROMPTS } from '@/lib/ai-assistant';
import { sendInstagramMessage, sendWhatsAppMessage } from '@/lib/meta-client';

/**
 * Meta Webhook Handler - Unified Ghost Protocol
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === 'imperiumgate_meta_verify_2024') {
      return new NextResponse(challenge);
    }
    return NextResponse.json({ error: 'Invalid verification' }, { status: 403 });
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    if (process.env.NODE_ENV === 'production' && (!signature || !verifyWebhookSignature(body, signature))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      return NextResponse.json({ success: true });
    }

    // 1. Handle Instagram
    if (data.object === 'instagram') {
      const messages = extractInstagramMessages(data);
      for (const msg of messages) {
        await processUnifiedMessage({
          platform: 'INSTAGRAM',
          timestamp: new Date(msg.timestamp),
          externalId: msg.message?.mid || `ig_${Date.now()}`,
          senderId: msg.sender.id,
          recipientId: msg.recipient.id,
          text: msg.message?.text || '',
          entrypoint: 'webhook'
        });
      }
    }

    // 2. Handle WhatsApp
    if (data.entry?.[0]?.changes?.[0]?.field === 'messages') {
      const waData = data.entry[0].changes[0].value;
      if (waData.messages) {
        const phoneNumberId = waData.metadata?.phone_number_id;
        for (const msg of waData.messages) {
          await processUnifiedMessage({
            platform: 'WHATSAPP',
            timestamp: new Date(parseInt(msg.timestamp) * 1000),
            externalId: msg.id,
            senderId: msg.from, // User Phone
            recipientId: phoneNumberId, // Our Business Phone ID
            text: msg.type === 'text' ? msg.text.body : `[${msg.type.toUpperCase()}]`,
            entrypoint: 'webhook'
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook processing error', err);
    return NextResponse.json({ success: true });
  }
}

interface UnifiedMessagePayload {
  platform: 'INSTAGRAM' | 'WHATSAPP';
  timestamp: Date;
  externalId: string;
  senderId: string;
  recipientId: string;
  text: string;
  entrypoint: string;
}

async function processUnifiedMessage(payload: UnifiedMessagePayload) {
  const { platform, timestamp, externalId, senderId, recipientId, text } = payload;

  // 1. Identify Channel & Customer
  const channelExternalId = senderId; // The user's ID/Phone

  // Upsert Channel (Ghost Table: channel)
  const channel = await prisma.channel.upsert({
    where: { type_externalId: { type: platform, externalId: channelExternalId } },
    update: { updatedAt: new Date() },
    create: {
      type: platform,
      externalId: channelExternalId,
      displayName: platform === 'WHATSAPP' ? `WA User ${senderId}` : `IG User ${senderId}`,
      isActive: true
    }
  });

  // 2. Link to Lead (Ghost Table: leads matching)
  // Try to find lead by phone or some ID
  let leadId: string | null = null;
  let lead = null;
  if (platform === 'WHATSAPP') {
    const phoneKey = senderId.replace('+', ''); // Simple heuristic
    lead = await prisma.lead.findFirst({
      where: { phone: { contains: phoneKey } }
    });
  }
  if (lead) leadId = lead.id;

  // 3. Upsert Conversation (Ghost Table: conversation)
  let conversation = await prisma.conversation.findFirst({
    where: { channelId: channel.id, status: 'ACTIVE' },
    orderBy: { lastMessageAt: 'desc' } // Fixed: updatedAt -> lastMessageAt (since updatedAt not in schema?)
    // If lastMessageAt also not sortable? It has index.
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        channelId: channel.id,
        contactId: senderId,
        status: 'ACTIVE',
        // leadId: leadId, // REMOVED: conversation table does not have leadId in schema viewed
        lastMessageAt: timestamp
      }
    });
  } else {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: timestamp }
    });
  }

  // 4. Store Unified Message (Ghost Table: message)
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      externalId: externalId,
      direction: 'INBOUND',
      source: platform,
      text: text,
      createdAt: timestamp
    }
  });

  // 5. Store Legacy/Platform Specific Message (Ghost Table: whatsappMessage / instagramMessage)
  if (platform === 'WHATSAPP') {
    const waAccount = await prisma.whatsappAccount.findUnique({ where: { phoneNumberId: recipientId } });
    await prisma.whatsappMessage.create({
      data: {
        whatsappAccountId: waAccount?.id,
        senderId: senderId,
        recipientId: recipientId, // Our PH ID
        phoneNumber: senderId,    // User PH
        message: text,
        messageId: externalId,    // FIXED: Added
        timestamp: timestamp,     // FIXED: Added
        direction: 'INBOUND',
        isFromUser: true,
        leadId: leadId
      }
    });
  } else {
    const igAccount = await prisma.instagramAccount.findFirst({ where: { instagramUserId: recipientId } });
    await prisma.instagramMessage.create({
      data: {
        instagramAccountId: igAccount?.id,
        senderId: senderId,
        recipientId: recipientId,
        message: text,
        messageId: externalId,
        timestamp: timestamp,
        direction: 'inbound',
        isFromUser: false, // Schema default true? But logic implies this is from external user.
        leadId: leadId
      }
    });
  }

  // 6. Notification (Ghost Table: notification)
  if (leadId) {
    if (lead?.assignedTo) {
      await prisma.notification.create({
        data: {
          userId: lead.assignedTo,
          type: 'MESSAGE',
          title: `New Message from ${lead.name || senderId}`,
          body: text.substring(0, 50),
          leadId: leadId
        }
      });
    }
  }

  // 7. AI Auto-Reply (Ghost Table: aIAutoReplyRule)
  const rules = await prisma.aIAutoReplyRule.findMany({
    where: {
      platform: platform,
      enabled: true,
      isActive: true
    },
    orderBy: { priority: 'desc' }
  });

  let replyText = null;

  for (const rule of rules) {
    if (rule.keyword === '*' || text.toLowerCase().includes(rule.keyword?.toLowerCase() || '')) {
      if (rule.useAI && rule.assistantId) {
        const assistant = await prisma.aIAssistant.findUnique({ where: { id: rule.assistantId } });
        if (assistant && assistant.isActive) {
          const chatMessages = [
            { role: 'system' as const, content: assistant.systemPrompt },
            { role: 'user' as const, content: text }
          ];
          replyText = await generateAIResponse(chatMessages, platform.toLowerCase() as any);
        }
      } else if (rule.response) {
        replyText = rule.response;
      }
      if (replyText) break;
    }
  }

  if (replyText) {
    try {
      if (platform === 'INSTAGRAM') {
        const igAccount = await prisma.instagramAccount.findFirst({ where: { instagramUserId: recipientId } });
        if (igAccount?.accessToken) {
          await sendInstagramMessage({
            recipientId: senderId,
            message: replyText,
            accessToken: igAccount.accessToken
          });
        }
      } else {
        const waAccount = await prisma.whatsappAccount.findUnique({ where: { phoneNumberId: recipientId } });
        if (waAccount?.accessToken) {
          await sendWhatsAppMessage(
            recipientId,
            senderId,
            replyText,
            waAccount.accessToken
          );
        }
      }

      // Log Reply
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          externalId: `reply_${Date.now()}`, // Temporary ID
          direction: 'OUTBOUND',
          source: platform,
          text: replyText,
          aiGenerated: true
        }
      });

      if (platform === 'WHATSAPP') {
        await prisma.whatsappMessage.create({
          data: {
            whatsappAccountId: (await prisma.whatsappAccount.findUnique({ where: { phoneNumberId: recipientId } }))?.id,
            senderId: recipientId, // We are sender
            recipientId: senderId,
            phoneNumber: senderId, // Associated user phone
            message: replyText,
            messageId: `reply_${Date.now()}`, // FIXED
            timestamp: new Date(),            // FIXED
            direction: 'OUTBOUND',
            isFromUser: false,
            leadId: leadId
          }
        });
      }

      // Log Audit
      try {
        // @ts-ignore
        const { logAudit } = await import('@/lib/audit');
        await logAudit({
          action: 'AI_AUTO_REPLY',
          details: `Replied to ${platform} message from ${senderId}`,
          entityId: leadId || undefined
        });
      } catch (e) { }

    } catch (sendErr) {
      console.error("Failed to send auto-reply:", sendErr);
    }
  }
}
