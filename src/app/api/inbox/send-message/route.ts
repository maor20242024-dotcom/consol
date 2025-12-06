import { NextRequest, NextResponse } from 'next/server';
import { sendInstagramMessage, sendWhatsAppMessage } from '@/lib/meta-client';

/**
 * Send message through unified inbox
 * POST /api/inbox/send-message
 */

export async function POST(req: NextRequest) {
  try {
    const { conversationId, message, channelType } = await req.json();

    if (!conversationId || !message || !channelType) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, message, channelType' },
        { status: 400 }
      );
    }

    // TODO: Get conversation details and channel credentials
    // For now, return success response
    console.log('[INBOX SEND MESSAGE]', {
      conversationId,
      message: message.substring(0, 50),
      channelType,
      status: 'TODO: Implement actual sending'
    });

    // TODO: Implement actual message sending based on channelType
    // if (channelType === 'instagram') {
    //   await sendInstagramMessage(pageId, recipientId, message, accessToken);
    // } else if (channelType === 'whatsapp') {
    //   await sendWhatsAppMessage(phoneNumberId, recipientNumber, message, accessToken);
    // }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      id: `msg_${Date.now()}` // Temporary ID
    });

  } catch (error) {
    console.error('[INBOX SEND MESSAGE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
