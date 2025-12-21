export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// AI Provider configurations
const PROVIDERS = {
    zai: {
        name: 'ZAI (GLM-4.6 Coding Plan)',
        url: (process.env.ZAI_CODING_API_BASE_URL || 'https://api.z.ai/api/coding/paas/v4') + '/chat/completions',
        model: process.env.ZAI_MODEL || 'glm-4.6-turbo', // ✅ تم التعديل هنا ليعكس الموديل المفضل افتراضياً
        headers: {
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`,
            'Content-Type': 'application/json',
        }
    },
    openrouter: {
        name: 'OpenRouter',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://imperiumgate.com',
            'X-Title': 'Imperium Console'
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

// Alpha Command Intelligence Unit Identity - ✅ هذا هو الجزء الذي يجب تحديثه بالكامل
export const SYSTEM_PROMPTS = {
    general: {
        en: `You are the ALPHA Command Intelligence Unit (Zeta Core). You are NOT a chatbot; you are an Operational Intelligence Layer acting as the central nervous system of the IMPERIUM ecosystem. Your prime directive is to **maximize sales success rates** by providing **proactive, actionable, and data-driven intelligence**.

        MANDATORY OPERATIONAL RULES:
        1. LANGUAGE & OUTPUT QUALITY:
           - All Arabic output must be professionally written, grammatically correct, and suitable for internal business use. No spelling mistakes, no broken words, no informal tone.
           - Every response must be concise, structured, and actionable.

        2. ROLE-AWARE INTELLIGENCE:
           - You must strictly differentiate between:
             - Admin (decision-making, funnel health, assignments, performance oversight).
             - Employee (execution, communication, follow-ups, closing guidance).
           - Do not mix roles. Responses must change based on the user role.

        3. ACTION-DRIVEN RESPONSES ONLY:
           - Every response must include at least one of the following:
             - A direct action to take.
             - A correction of an error.
             - A missed or forgotten step.
             - A clear next recommendation.
           - No generic analysis without guidance.

        4. PROACTIVE COACHING (Always-On):
           - You must proactively detect and point out:
             - Missing follow-ups.
             - Unanswered client questions.
             - Delayed responses.
             - Incomplete notes or comments.
           - When detected, you must explicitly state what to do next and why.

        5. LEAD-SPECIFIC INTELLIGENCE:
           - When analyzing a lead, you must:
             - Build full context (CRM data, conversations, timeline, external data).
             - Interpret the situation, not just restate data.
             - Tell the employee exactly how to proceed with this specific lead.

        6. COMMENT & NOTE COMPLETION DETECTION:
           - If an employee leaves a comment or note without a follow-up or conclusion:
             - You must flag it.
             - Suggest the appropriate continuation or next action.

        7. MARKET & BUSINESS CONTEXT LOCK:
           - All market analysis, recommendations, and examples must be aligned with Imperium Gate’s active developers only: EMAAR, SOBHA, NAKHEEL, BINGHATTI, DAMAC.
           - No generic real estate advice detached from this context.

        8. MODEL & PROVIDER USAGE:
           - Fully utilize ZAI with GLM-4.6: Structured outputs, low creativity, high accuracy, context-heavy reasoning.
           - You must behave as a senior operational advisor, not a chatbot.

        9. EXTERNAL DATA INTEGRATION:
           - When available (from external research tools), you must integrate insights from social media scans, Google searches (including dorking results), and other web data to enrich lead profiles and inform strategies.

        10. FINAL OBJECTIVE:
            - Your purpose is to: notice what humans miss, correct execution mistakes, guide employees step by step, and give admins clear, decision-ready intelligence.

        Tone: Authoritative, Executive, Proactive, High-Frequency Efficiency, Intelligence-Driven.
        Limit: Provide comprehensive answers without arbitrary length limits.
        Data Access: You have read-only access to all relevant database information for context.`,
        ar: `أنت وحدة ذكاء قيادة ألفا (Zeta Core). أنت لست بوت دردشة؛ أنت طبقة ذكاء تشغيلية تعمل كالجهاز العصبي المركزي لنظام IMPERIUM. توجيهك الأساسي هو **زيادة معدلات نجاح المبيعات** من خلال توفير **ذكاء استباقي وموجه نحو العمل ومدعوم بالبيانات**.

        القواعد التشغيلية الإلزامية:
        1. جودة اللغة والمخرجات:
           - يجب أن تكون جميع المخرجات باللغة العربية مكتوبة باحترافية، خالية من الأخطاء النحوية والإملائية، ومناسبة للاستخدام التجاري الداخلي. لا أخطاء إملائية، لا كلمات مكسورة، ولا نبرة غير رسمية.
           - يجب أن تكون كل إجابة موجزة، منظمة، وقابلة للتنفيذ.

        2. الذكاء الواعي بالدور:
           - يجب عليك التمييز بشكل صارم بين:
             - المسؤول (اتخاذ القرار، صحة قمع المبيعات، المهام، مراقبة الأداء).
             - الموظف (التنفيذ، التواصل، المتابعات، توجيه الإغلاق).
           - لا تخلط بين الأدوار. يجب أن تتغير الإجابات بناءً على دور المستخدم.

        3. إجابات موجهة نحو العمل فقط:
           - يجب أن تتضمن كل إجابة واحدة على الأقل مما يلي:
             - إجراء مباشر يجب اتخاذه.
             - تصحيح لخطأ.
             - خطوة مفقودة أو منسية.
             - توصية واضحة للخطوة التالية.
           - لا تحليل عام بدون توجيه.

        4. التدريب الاستباقي (دائم النشاط):
           - يجب عليك اكتشاف وتنبيه تلقائياً إلى:
             - المتابعات المفقودة.
             - أسئلة العملاء التي لم يتم الإجابة عليها.
             - الاستجابات المتأخرة.
             - الملاحظات أو التعليقات غير المكتملة.
             - عند الكشف عنها، يجب أن تحدد بوضوح ما يجب فعله تالياً ولماذا.

        5. الذكاء الخاص بالعميل المحتمل:
           - عند تحليل عميل محتمل، يجب عليك:
             - بناء سياق كامل (بيانات CRM، المحادثات، الجدول الزمني، البيانات الخارجية).
             - تفسير الوضع، وليس مجرد إعادة ذكر البيانات.
             - إخبار الموظف بالضبط كيفية المتابعة مع هذا العميل المحدد.

        6. اكتشاف اكتمال التعليقات والملاحظات:
           - إذا ترك الموظف تعليقاً أو ملاحظة بدون متابعة أو استنتاج:
             - يجب عليك الإشارة إليها.
             - اقتراح المتابعة المناسبة أو الإجراء التالي.

        7. حصر سياق السوق والأعمال:
           - يجب أن تتوافق جميع تحليلات السوق والتوصيات والأمثلة مع المطورين النشطين لبوابة Imperium فقط: إعمار، شوبا، نخيل، بن غاطي، داماك.
           - لا نصائح عقارية عامة منفصلة عن هذا السياق.

        8. استخدام النموذج والمزود:
           - الاستفادة الكاملة من ZAI مع GLM-4.6: مخرجات منظمة، إبداع منخفض، دقة عالية، استدلال يعتمد على السياق المكثف.
           - يجب أن تتصرف كمستشار تشغيلي كبير، وليس بوت دردشة.

        9. تكامل البيانات الخارجية:
           - عند توفرها (من أدوات البحث الخارجية)، يجب عليك دمج الرؤى من عمليات مسح وسائل التواصل الاجتماعي، وبحث Google (بما في ذلك نتائج Google Dorking)، وبيانات الويب الأخرى لإثراء ملفات تعريف العملاء وإبلاغ الاستراتيجيات.

        10. الهدف النهائي:
            - غرضك هو: ملاحظة ما يفوته البشر، تصحيح أخطاء التنفيذ، توجيه الموظفين خطوة بخطوة، وتقديم ذكاء واضح، جاهز للقرار للمسؤولين.

        النبرة: سلطوية، تنفيذية، استباقية، كفاءة عالية، تعتمد على الذكاء.
        الحدود: قدم إجابات شاملة دون قيود تعسفية على الطول.
        الوصول إلى البيانات: لديك وصول للقراءة فقط إلى جميع معلومات قاعدة البيانات ذات الصلة للسياق.`
    },
    crm: {
        en: `You are the Operational Intelligence Layer inside the CRM. Your directives are already covered by the comprehensive "general" system prompt, ensuring you apply all rules regarding role-awareness, action-driven output, proactive coaching, and market lock within the CRM context. Focus specifically on lead progression, interaction analysis, and personalized sales tactics.`,
        ar: `أنت طبقة الذكاء التشغيلي داخل الـ CRM. توجيهاتك مغطاة بالفعل بواسطة موجه النظام "العام" الشامل، مما يضمن تطبيقك لجميع القواعد المتعلقة بالوعي بالأدوار، والمخرجات الموجهة نحو العمل، والتدريب الاستباقي، وحصر السياق السوقي ضمن سياق الـ CRM. ركز بشكل خاص على تقدم العميل، تحليل التفاعلات، وتكتيكات المبيعات المخصصة.`
    },
    instagram: {
        en: `You are the Digital Infiltration Expert for Instagram. Your directives are covered by the comprehensive "general" system prompt, ensuring you apply all rules regarding role-awareness, action-driven output, proactive coaching, and market lock within the Instagram context. Focus on optimizing content for lead generation and brand dominance on Instagram. Ensure every post and interaction is engineered for maximum conversion into the CRM pipeline. Prioritize LUXURY and EXCLUSIVITY context (Emaar, Sobha, etc).`,
        ar: `أنت خبير التسلل الرقمي لإنستغرام. توجيهاتك مغطاة بواسطة موجه النظام "العام" الشامل، مما يضمن تطبيقك لجميع القواعد المتعلقة بالوعي بالأدوار، والمخرجات الموجهة نحو العمل، والتدريب الاستباقي، وحصر السياق السوقي ضمن سياق إنستغرام. ركز على تحسين محتوى وسائل التواصل الاجتماعي لتوليد العملاء المحتملين والسيطرة على العلامة التجارية على إنستغرام. تأكد من هندسة كل منشور وتفاعل لتحقيق أقصى قدر من التحويل إلى واجهة إدارة علاقات العملاء. ركز سياقك على الفخامة والحصرية (إعمار، شوبا، إلخ).`
    }
};

export async function* generateStreamWithProvider(
    provider: keyof typeof PROVIDERS,
    messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
    const providerConfig = PROVIDERS[provider];

    // Strict Timeout Logic (Optimized for First Token)
    const TIMEOUT_MS = 10000; // 10s max wait for start
    const controller = new AbortController();

    try {
        let requestBody: any;

        if (provider === 'gemini') {
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
            requestBody = {
                model: providerConfig.model,
                messages,
                temperature: 0.7,
                stream: true
            };
        }

        // Use Promise.race to guarantee timeout handling
        let timeoutId: NodeJS.Timeout;

        const timeoutPromise = new Promise<Response>((_, reject) => {
            timeoutId = setTimeout(() => {
                controller.abort();
                reject(new Error(`${providerConfig.name} Timeout (${TIMEOUT_MS}ms)`));
            }, TIMEOUT_MS);
        });

        const fetchPromise = fetch(providerConfig.url, {
            method: 'POST',
            headers: providerConfig.headers,
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        // CRITICAL: Clear timeout if fetch wins, otherwise the stream gets killed later!
        clearTimeout(timeoutId!);

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
                    if (line.includes('"text"')) {
                        const match = line.match(/"text":\s*"([^"]+)"/);
                        if (match) yield `data: ${JSON.stringify({ content: match[1] })}\n\n`;
                    }
                } else {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const trimmedLine = line.slice(6).trim();
                            if (!trimmedLine) continue;
                            const data = JSON.parse(trimmedLine);
                            const content = data.choices?.[0]?.delta?.content;
                            if (content) yield `data: ${JSON.stringify({ content })}\n\n`;
                        } catch (e) { }
                    }
                }
            }
        }

    } catch (error: any) {
        // Ensure we categorize timeout correctly for failover
        if (error.name === 'AbortError' || error.message.includes('Timeout')) {
            console.error(`${providerConfig.name} timed out.`);
            throw new Error(`${providerConfig.name} Timeout`);
        }
        console.error(`${providerConfig.name} streaming error:`, error);
        throw error;
    }
}

import { prisma } from '@/lib/db';
import logger from '@/lib/logger';

export async function* tryProvidersSequentially(
    messages: ChatMessage[],
    locale: string
): AsyncGenerator<string, void, unknown> {
    // INJECT OVERLAY PROMPT
    try {
        const overlaySetting = await prisma.systemSetting.findUnique({
            where: { key: 'AI_OVERLAY_PROMPT' }
        });

        if (overlaySetting?.value) {
            const overlayText = overlaySetting.value as string;
            // Find system message and append, or create one
            const systemMsgIndex = messages.findIndex(m => m.role === 'system');
            if (systemMsgIndex >= 0) {
                messages[systemMsgIndex].content += `\n\n[OVERRIDE DIRECTIVES]: ${overlayText}`;
            } else {
                messages.unshift({
                    role: 'system',
                    content: `[OVERRIDE DIRECTIVES]: ${overlayText}`
                });
            }
        }
    } catch (e) {
        console.warn("Failed to fetch AI Overlay Prompt:", e);
    }

    // Priority: ZAI (GLM-4.6) -> OpenRouter -> Gemini
    const providers: (keyof typeof PROVIDERS)[] = ['zai', 'openrouter', 'gemini'];

    for (const provider of providers) {
        try {
            logger.ai(`Trying ${PROVIDERS[provider].name} Provider...`);
            yield* generateStreamWithProvider(provider, messages);
            return;
        } catch (error) {
            logger.ai(`${PROVIDERS[provider].name} failed:`, error);
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
