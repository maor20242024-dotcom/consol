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
  leadId?: string; // Optional context ID
  conversationHistory: ChatMessage[];
  locale?: string; // Explicit locale override
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body: ChatRequest = await req.json();

    const { message, mode, leadId, conversationHistory, locale: bodyLocale } = body;
    // 1. Prioritize explicit locale from client, fall back to header
    const rawLocale = bodyLocale || req.headers.get('accept-language') || 'en';
    const locale = rawLocale.startsWith('ar') ? 'ar' : 'en';

    // Add system message based on mode
    // @ts-ignore - Index signature mismatch, safe here
    const baseSystemPrompt = SYSTEM_PROMPTS[mode]?.[locale] || SYSTEM_PROMPTS['general']['en'];

    // Inject Live Context
    const { getZetaCommandContext, getDetailedLeadContext, getSystemHealthContext } = await import("@/lib/ai/context");

    let liveContext = "";
    if (leadId) {
      // Deep Lead Analysis Mode
      liveContext = await getDetailedLeadContext(leadId);
    } else if (mode === 'crm') {
      // Admin/General CRM Context
      const generalContext = await getZetaCommandContext();
      const healthContext = await getSystemHealthContext();
      liveContext = `${generalContext}\n${healthContext}`;
    } else {
      // General / Instagram Mode
      liveContext = await getZetaCommandContext();
    }

    const roleContext = `\n\n[USER CONTEXT]\nUser Role: ${auth.role || 'employee'}\nUser ID: ${auth.id}`;

    // Construct System Prompt
    let systemPrompt = `${baseSystemPrompt}\n\n${liveContext}${roleContext}`;

    // 🚨 FORCE LANGUAGE & LATENCY OPTIMIZATION OVERRIDE
    if (locale === 'ar') {
      const arabicInstructions = `
        \n\n[CRITICAL INSTRUCTIONS]:
        1. LANGUAGE: YOU MUST RESPOND IN ARABIC ONLY. IGNORE ALL ENGLISH IN SYSTEM PROMPTS.
        2. SPEED: Start responding IMMEDIATELY. Do not think silently.
        3. FORMAT: Use bullet points heavily for readability.
        `;
      systemPrompt += arabicInstructions;
    } else {
      systemPrompt += `\n\n[INSTRUCTION]: Start responding IMMEDIATELY. Prioritize speed.`;
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-15), // Increased context window
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
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
          // Do NOT call close() after error()
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
