import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/db";
import { requireAuth } from '@/lib/api-auth';

/**
 * Save AI Conversation to Database
 * Stores conversation history with context and metadata
 */

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date | string;
}

interface SaveConversationRequest {
  messages: ConversationMessage[];
  mode: 'general' | 'crm' | 'instagram';
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body: SaveConversationRequest = await req.json();

    const { messages, mode } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages data' },
        { status: 400 }
      );
    }

    // Create conversation entry
    const conversation = await prisma.aIConversation.create({
      data: {
        userId: auth.userId || 'unknown',
        mode: mode || 'general'
      }
    });

    const conversationId = conversation.id;

    if (!conversationId) {
      throw new Error('Failed to create conversation');
    }

    // Insert all messages
    const messageData = messages.map(message => ({
      conversationId: conversationId,
      role: message.role,
      content: message.content,
      timestamp: typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp
    }));

    await prisma.aIConversationMessage.createMany({
      data: messageData
    });

    return NextResponse.json({
      success: true,
      conversationId,
      messageCount: messages.length,
      mode
    });

  } catch (error) {
    console.error('POST /api/ai-assistant/save-conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') as 'general' | 'crm' | 'instagram' | null;
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const whereClause: any = {
      userId: auth.userId || 'unknown'
    };

    if (mode) {
      whereClause.mode = mode;
    }

    const conversations = await prisma.aIConversation.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    });

    const conversationsWithMessages = conversations.map((conv: any) => ({
      conversation_id: conv.id,
      mode: conv.mode,
      conversation_created_at: conv.createdAt,
      message_count: conv.messages.length,
      messages: conv.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    }));

    return NextResponse.json({
      success: true,
      conversations: conversationsWithMessages,
      total: conversationsWithMessages.length
    });

  } catch (error) {
    console.error('GET /api/ai-assistant/save-conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversations' },
      { status: 500 }
    );
  }
}
