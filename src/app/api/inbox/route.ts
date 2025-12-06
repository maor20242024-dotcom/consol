import { NextRequest, NextResponse } from 'next/server';
import { sendInstagramMessage } from '@/lib/meta-client';
import { log, error } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

/**
 * Unified Inbox API Endpoint
 * GET: Retrieve messages
 * POST: Send message
 */

export async function GET(req: NextRequest) {
  try {
    log('GET /api/inbox - Retrieving messages from database');

    const auth = await requireAuth(req);

    // Get user's Instagram accounts
    const userInstagramAccounts = await prisma.instagramAccount.findMany({
      where: { userId: auth.userId || 'unknown' },
      select: { id: true, instagramUserId: true }
    });

    const userWhatsappAccounts = await prisma.whatsappAccount.findMany({
      where: { userId: auth.userId || 'unknown' },
      select: { id: true, phoneNumberId: true }
    });

    // ✅ Get Instagram messages without raw SQL
    const instagramMessages = await prisma.instagramMessage.findMany({
      where: {
        OR: [
          { instagramAccountId: { in: userInstagramAccounts.map(acc => acc.id) } },
          { senderId: { in: userInstagramAccounts.map(acc => acc.instagramUserId) } },
          { recipientId: { in: userInstagramAccounts.map(acc => acc.instagramUserId) } }
        ]
      },
      include: {
        lead: true,
        campaign: true
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    // ✅ Get WhatsApp messages without raw SQL
    const whatsappMessages = await prisma.whatsappMessage.findMany({
      where: {
        OR: [
          { whatsappAccountId: { in: userWhatsappAccounts.map(acc => acc.id) } },
          { senderId: { in: userWhatsappAccounts.map(acc => acc.phoneNumberId) } },
          { recipientId: { in: userWhatsappAccounts.map(acc => acc.phoneNumberId) } }
        ]
      },
      include: {
        lead: true,
        campaign: true
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    // Combine and sort messages
    const combinedMessages = [...instagramMessages, ...whatsappMessages]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    return NextResponse.json({
      success: true,
      messages: combinedMessages,
      total: combinedMessages.length
    });

  } catch (err: any) {
    error('GET /api/inbox error', err);
    return NextResponse.json(
      { error: 'Failed to retrieve messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body = await req.json();
    const { platform, recipient, message } = body;

    log('POST /api/inbox - Sending message', {
      platform,
      recipient,
      messageLength: message?.length
    });

    // Validate request
    if (!platform || !recipient || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, recipient, message' },
        { status: 400 }
      );
    }

    if (platform === 'instagram') {
      const userInstagramAccount = await prisma.instagramAccount.findFirst({
        where: {
          userId: auth.userId || 'unknown',
          status: 'connected'
        }
      });

      if (!userInstagramAccount) {
        return NextResponse.json(
          { error: 'Instagram account not connected' },
          { status: 400 }
        );
      }

      // Send Instagram message
      const result = await sendInstagramMessage({
        pageId: userInstagramAccount.instagramUserId,
        recipientId: recipient,
        message: message,
        accessToken: userInstagramAccount.accessToken // ✅ (should be decrypted)
      });

      if (result === true || (result as any)?.recipient_id || (result as any)?.message_id) {
        // ✅ Store message without raw SQL
        await prisma.instagramMessage.create({
          data: {
            senderId: userInstagramAccount.instagramUserId,
            recipientId: recipient,
            message: message,
            timestamp: new Date(),
            messageId: (result as any)?.message_id || `msg_${Date.now()}`,
            isFromUser: false,
            direction: 'outgoing',
            instagramAccountId: userInstagramAccount.id
          }
        });

        return NextResponse.json({
          success: true,
          messageId: (result as any)?.message_id
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to send message' },
          { status: 500 }
        );
      }
    } else if (platform === 'whatsapp') {
      const userWhatsappAccount = await prisma.whatsappAccount.findFirst({
        where: {
          userId: auth.userId || 'unknown',
          status: 'connected'
        }
      });

      if (!userWhatsappAccount) {
        return NextResponse.json(
          { error: 'WhatsApp account not connected' },
          { status: 400 }
        );
      }

      // TODO: Implement WhatsApp message sending
      // For now, store the message
      await prisma.whatsappMessage.create({
        data: {
          senderId: userWhatsappAccount.phoneNumberId,
          recipientId: recipient,
          message: message,
          timestamp: new Date(),
          messageId: `msg_${Date.now()}`,
          isFromUser: false,
          direction: 'outgoing',
          whatsappAccountId: userWhatsappAccount.id,
          phoneNumber: recipient
        }
      });

      return NextResponse.json({
        success: true,
        messageId: `msg_${Date.now()}`,
        platform: 'whatsapp'
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 }
      );
    }

  } catch (err: any) {
    error('POST /api/inbox error', err);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
