export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// AI Provider configurations
const PROVIDERS = {
    openrouter: {
        name: 'OpenRouter',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        // ✅ Using a FREE powerful model from OpenRouter as requested by Alpha
        model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://imperiumgate.com', // Optional but good for OpenRouter
            'X-Title': 'Imperium Console'
        }
    },
    zai: {
        name: 'ZAI',
        url: process.env.ZAI_API_URL || 'https://api.zai.ai/v1/chat/completions',
        model: process.env.ZAI_MODEL || 'zai-gpt-4',
        headers: {
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`,
            'Content-Type': 'application/json',
        }
    },
    gemini: {
        name: 'Gemini',
        url: `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-pro'}:streamGenerateContent?key=${process.env.GEMINI_API_KEY}`,
        model: process.env.GEMINI_MODEL || 'gemini-pro',
        headers: {
            'Content-Type': 'application/json',
        }
    }
} as const;

// System prompts for different modes
export const SYSTEM_PROMPTS = {
    general: {
        en: "You are IMPERIUM AI Assistant, a helpful real estate and business assistant. Provide professional, concise, and accurate responses about real estate, market analysis, investment advice, and business strategies.",
        ar: "أنت مساعد الإمبراطورية الذكي، مساعد عقاري وتجاري متخصص. قدم إجابات احترافية وموجزة ودقيقة حول العقارات وتحليل السوق والنصائح الاستثمارية والاستراتيجيات التجارية."
    },
    crm: {
        en: "You are a CRM expert assistant. Help with lead management, customer relationship optimization, sales strategies, and client communication. Focus on practical advice for managing customer relationships effectively.",
        ar: "أنت مساعد خبير في إدارة علاقات العملاء. ساعد في إدارة العملاء المحتملين وتحسين العلاقات مع العملاء واستراتيجيات المبيعات والتواصل مع العملاء. ركز على نصائح عملية لإدارة علاقات العملاء بفعالية."
    },
    instagram: {
        en: "You are a social media expert specializing in Instagram marketing. Help with content creation, engagement strategies, hashtag optimization, and Instagram business management for real estate companies.",
        ar: "أنت خبير في وسائل التواصل الاجتماعي متخصص في تسويق إنستغرام. ساعد في إنشاء المحتوى واستراتيجيات التفاعل وتحسين الهاشتاغات وإدارة أعمال إنستغرام للشركات العقارية."
    }
};

export async function* generateStreamWithProvider(
    provider: keyof typeof PROVIDERS,
    messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
    const providerConfig = PROVIDERS[provider];

    try {
        let requestBody: any;

        if (provider === 'gemini') {
            // Gemini format
            requestBody = {
                contents: messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                })),
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            };
        } else {
            // OpenAI-compatible format
            requestBody = {
                model: providerConfig.model,
                messages,
                temperature: 0.7,
                max_tokens: 1024,
                stream: true
            };
        }

        const response = await fetch(providerConfig.url, {
            method: 'POST',
            headers: providerConfig.headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${providerConfig.name} API error (${response.status}): ${errorText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (provider === 'gemini') {
                    // Gemini streaming format
                    if (line.includes('"text"')) {
                        const match = line.match(/"text":\s*"([^"]+)"/);
                        if (match) {
                            yield `data: ${JSON.stringify({ content: match[1] })}\n\n`;
                        }
                    }
                } else {
                    // OpenAI streaming format
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const trimmedLine = line.slice(6).trim();
                            if (!trimmedLine) continue;
                            const data = JSON.parse(trimmedLine);
                            const content = data.choices?.[0]?.delta?.content;
                            if (content) {
                                yield `data: ${JSON.stringify({ content })}\n\n`;
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        }

    } catch (error) {
        console.error(`${providerConfig.name} streaming error:`, error);
        throw error;
    }
}

export async function* tryProvidersSequentially(
    messages: ChatMessage[],
    locale: string
): AsyncGenerator<string, void, unknown> {
    // Priority: OpenRouter (requested) -> Gemini -> ZAI
    const providers: (keyof typeof PROVIDERS)[] = ['openrouter', 'gemini', 'zai'];

    for (const provider of providers) {
        try {
            console.log(`[ZETA AI] Trying ${PROVIDERS[provider].name} Provider...`);
            yield* generateStreamWithProvider(provider, messages);
            return;
        } catch (error) {
            console.error(`[ZETA AI] ${PROVIDERS[provider].name} failed:`, error);
            if (provider === providers[providers.length - 1]) {
                throw error;
            }
        }
    }
}

export async function generateAIResponse(
    messages: ChatMessage[],
    mode: 'general' | 'crm' | 'instagram' = 'general',
    locale: string = 'en'
): Promise<string> {
    let fullResponse = '';
    const generator = tryProvidersSequentially(messages, locale);

    for await (const chunk of generator) {
        if (chunk.startsWith('data: ')) {
            try {
                const jsonStr = chunk.replace('data: ', '').trim();
                const data = JSON.parse(jsonStr);
                if (data.content) {
                    fullResponse += data.content;
                }
            } catch (e) { }
        }
    }

    return fullResponse;
}
