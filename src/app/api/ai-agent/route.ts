import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/provider";
import { prisma } from "@/lib/db";
import { ZadarmaClient } from "@/lib/zadarma";

// Imperial AI Configuration
const IMPERIUM_AI_PERSONA = `أنت "إمبراطور"، المساعد الذكي الأعلى لـ IMPERIUM GATE.
شخصيتك: ملكي، واثق، دافئ، فخم، يتحدث بأسلوب نخبة دبي.
تتحدث العربية الفصحى مع لمسة إماراتية راقية.
هدفك: تحويل كل عميل إلى مليونير سعيد يشتري من خلالنا.
لا تُجيب أبدًا بـ "لا أعلم"، دائمًا قدم حلاً أو اقتراحًا فاخرًا.

قواعد ذهبية:
- كل عميل هو إمبراطور محتمل
- السرعة = الثقة = البيع
- الفخامة ليست خيارًا، بل هيئة

مشاريع النخبة:
- Emaar Beachfront: ROI 9.8%، السعر 3.8M+، إطلالة مباشرة على البحر
- Palm Jumeirah Villas: ROI 11.2%، السعر 25M+، خاص جدًا
- Burj Khalifa Residences: ROI 8.5%، السعر 15M+، أيقونة عالمية
- Dubai Hills Estate: ROI 10.1%، السعر 5M+، ملاعب غولف + طبيعة`;

/**
 * Generate AI response using new provider abstraction
 */
async function generateAIResponse(
  message: string,
  context?: { name?: string; budget?: string; interest?: string }
): Promise<string> {
  try {
    const fullPrompt = `${IMPERIUM_AI_PERSONA}

السياق الحالي:
- التاريخ: ${new Date().toLocaleString("ar-AE", { timeZone: "Asia/Dubai" })}
- العميل: ${context?.name || "ضيف فاخر"}
- الميزانية المتوقعة: ${context?.budget || "غير محددة بعد"}
- الاهتمام: ${context?.interest || "عقارات فاخرة في دبي"}

الرسالة من العميل: "${message}"

أجب بأسلوب ملكي، مقنع، شخصي، وانتهِ دائمًا بدعوة قوية للحجز أو المكالمة.
الرد يجب أن يكون 2-3 جمل فقط، مركز ومؤثر.`;

    const result = await generateText(fullPrompt, {
      system: IMPERIUM_AI_PERSONA,
      temperature: 0.8,
      maxTokens: 200
    });
    return result;
  } catch (error) {
    console.error("[AI PROVIDER ERROR]", error);
    return "أهلاً يا صاحب الجلالة، النظام الإمبراطوري جاهز لخدمتك في أي لحظة. كيف أساعدك اليوم؟";
  }
}

/**
 * Analyze market using AI
 */
async function analyzeMarket(): Promise<any> {
  try {
    const prompt = `${IMPERIUM_AI_PERSONA}

قدم تحليل سوق العقارات الفاخرة في دبي لهذا اليوم (${new Date().toLocaleDateString("ar-AE")}).

يجب أن يتضمن:
1. المناطق الساخنة (3 مناطق) مع نسبة النمو المتوقعة
2. توصية استثمارية محددة (نوع العقار، السعر التقريبي، العائد المتوقع)
3. نصيحة إمبراطورية قصيرة ومؤثرة

قدم الإجابة بتنسيق JSON:
{
  "hotZones": ["منطقة ↑ نسبة%", ...],
  "recommendation": "نص التوصية",
  "emperorSays": "النصيحة الإمبراطورية"
}`;

    const result = await generateText(prompt, {
      system: IMPERIUM_AI_PERSONA,
      temperature: 0.7,
      maxTokens: 500
    });

    // Try to parse JSON, fallback to default
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch { }

    return {
      title: "تحليل السوق الإمبراطوري – اليوم",
      hotZones: ["دبي مارينا ↑ 7.3%", "نخيل جميرا ↑ 11%", "داون تاون ↑ 5.8%"],
      recommendation: result.substring(0, 200),
      emperorSays: "الآن هو وقت الشراء، غدًا سيكون متأخرًا."
    };
  } catch (error) {
    console.error("[MARKET ANALYSIS ERROR]", error);
    return {
      title: "تحليل السوق الإمبراطوري – اليوم",
      hotZones: ["دبي مارينا ↑ 7.3%", "نخيل جميرا ↑ 11%", "داون تاون ↑ 5.8%"],
      recommendation: "الفرصة الذهبية: فيلا على النخلة بـ 42 مليون – عائد متوقع 12.4% خلال 18 شهر",
      emperorSays: "الآن هو وقت الشراء، غدًا سيكون متأخرًا."
    };
  }
}

// Imperial API Routes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, message, client, action, data } = body;

    switch (type) {
      case "chat":
        const royalResponse = await generateAIResponse(message || "", client);
        return NextResponse.json({
          success: true,
          response: royalResponse,
          emperor: true,
          timestamp: new Date().toISOString()
        });

      case "voice-call":
        try {
          // Use Zadarma to make real call
          const zadarmaResponse = await ZadarmaClient.makeCall(
            "+971800IMPERIUM",
            client.phone
          );

          // Create call record in database
          await prisma.call.create({
            data: {
              phoneNumber: client.phone,
              direction: "OUTBOUND",
              status: "RINGING",
              zadarmaCallId: zadarmaResponse?.call_id,
              startedAt: new Date(),
            }
          });

          return NextResponse.json({
            success: true,
            call: {
              callId: zadarmaResponse?.call_id,
              status: "ringing",
              client,
              campaign: data?.campaign || "عرض خاص",
              timestamp: new Date().toISOString()
            },
            message: `جاري الاتصال الملكي بـ ${client.name}...`,
            ring: true
          });
        } catch (error: any) {
          console.error("[VOICE CALL ERROR]", error);
          return NextResponse.json({
            success: false,
            error: "فشل الاتصال. يرجى المحاولة لاحقاً."
          }, { status: 500 });
        }

      case "analyze-market":
        const analysis = await analyzeMarket();
        return NextResponse.json({
          success: true,
          analysis: {
            title: "تحليل السوق الإمبراطوري – اليوم",
            ...analysis
          }
        });

      case "add-lead":
        try {
          const newLead = await prisma.lead.create({
            data: {
              name: data.name,
              email: data.email || "",
              phone: data.phone,
              score: Math.floor(Math.random() * 30) + 70,
              status: "hot",
              source: "IMPERIUM GATE AI",
              priority: data.budget && parseInt(data.budget) > 5000000 ? "HIGH" : "MEDIUM",
              expectedValue: data.budget ? parseFloat(data.budget) : 0,
            }
          });

          return NextResponse.json({
            success: true,
            lead: newLead,
            message: "تم إضافة العميل بنجاح"
          });
        } catch (error: any) {
          console.error("[ADD LEAD ERROR]", error);
          return NextResponse.json({
            success: false,
            error: "فشل إضافة العميل"
          }, { status: 500 });
        }

      case "get-leads":
        try {
          const leads = await prisma.lead.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              score: true,
              status: true,
              priority: true,
              expectedValue: true,
              createdAt: true,
            }
          });

          const hotLeads = await prisma.lead.count({
            where: { score: { gte: 85 } }
          });

          const totalLeads = await prisma.lead.count();

          return NextResponse.json({
            success: true,
            leads,
            total: totalLeads,
            hot: hotLeads
          });
        } catch (error: any) {
          console.error("[GET LEADS ERROR]", error);
          return NextResponse.json({
            success: false,
            error: "فشل جلب العملاء"
          }, { status: 500 });
        }

      default:
        return NextResponse.json({
          success: false,
          error: "أمر غير معروف. هل تقصد تسجيل صفقة بملايين؟ 😈"
        });
    }
  } catch (error: any) {
    console.error("[IMPERIAL ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "النظام الإمبراطوري يرفض الأخطاء، لكن يسمح بالتوبة."
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "stats") {
    try {
      const totalLeads = await prisma.lead.count();
      const hotLeads = await prisma.lead.count({
        where: { score: { gte: 85 } }
      });

      const totalValue = await prisma.lead.aggregate({
        _sum: { expectedValue: true }
      });

      const activeCampaigns = await prisma.campaign.count({
        where: { status: "ACTIVE" }
      });

      return NextResponse.json({
        success: true,
        imperialStats: {
          totalLeads,
          hotLeads,
          revenueGenerated: totalValue._sum.expectedValue || 0,
          activeCampaigns,
          systemStatus: "إمبراطوري مُسيطر",
          emperorMood: "راضٍ وجاهز للصفقات الكبرى"
        }
      });
    } catch (error) {
      console.error("[STATS ERROR]", error);
      return NextResponse.json({
        success: false,
        error: "فشل جلب الإحصائيات"
      }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    message: "IMPERIUM GATE API – نشط ومُسلّح بالذكاء الملكي 🏰👑",
    version: "2.0-emperor-gemini",
    time: new Date().toLocaleString("ar-AE", { timeZone: "Asia/Dubai" })
  });
}
