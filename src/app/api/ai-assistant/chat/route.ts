import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { ChatMessage, SYSTEM_PROMPTS, tryProvidersSequentially } from '@/lib/ai-assistant';

/**
 * AI Assistant Chat API
 * Uses shared library for multi-provider support
 */

interface ChatRequest {
  message: string;
  mode: 'general' | 'crm' | 'instagram';
  conversationHistory: ChatMessage[];
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body: ChatRequest = await req.json();

    const { message, mode, conversationHistory } = body;
    const locale = req.headers.get('accept-language')?.startsWith('ar') ? 'ar' : 'en';

    // Add system message based on mode
    // @ts-ignore - Index signature mismatch, safe here
    const systemPrompt = SYSTEM_PROMPTS[mode]?.[locale] || SYSTEM_PROMPTS['general']['en'];

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamGenerator = tryProvidersSequentially(messages, locale);

          for await (const chunk of streamGenerator) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }

          // Signal completion
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('POST /api/ai-assistant/chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
