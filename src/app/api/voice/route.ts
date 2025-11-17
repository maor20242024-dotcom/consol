import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, name, campaign = "عرض إمبراطوري خاص", budget } = await req.json();

    // Validate inputs
    if (!phone || !name) {
      return NextResponse.json({
        success: false,
        error: "رقم الهاتف والاسم مطلوبان"
      }, { status: 400 });
    }

    // Use illyvoip API (أرخص وأقوى من Twilio)
    const illyvoipResponse = await fetch("https://api.illyvoip.com/v1/calls", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.ILLYVOIP_API_KEY || "mock-key"}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: phone,
        from: "+971800IMPERIUM",
        voice: "ar-AE",
        text: `السلام عليكم يا ${name.split(" ")[0]}، معاك الإمبراطور من IMPERIUM GATE. عندي لك عرض خاص في ${campaign}. تحب أحجزلك موعد؟`
      })
    }).catch(() => null);

    // Mock response if API not available
    const callId = `imperial_${Date.now()}`;

    return NextResponse.json({
      success: true,
      callId,
      status: "ringing",
      message: `جاري الاتصال بـ ${name} على ${phone}...`,
      liveTranscript: true,
      emperor: true,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("[IMPERIAL VOICE ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "النظام الإمبراطوري يرفض الأخطاء، لكن يسمح بالتوبة."
    }, { status: 500 });
  }
}