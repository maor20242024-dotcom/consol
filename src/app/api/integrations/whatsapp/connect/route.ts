import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { phoneNumberId, accessToken, phoneNumber, businessName } = await req.json();

    if (!phoneNumberId || !accessToken || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const account = await prisma.whatsappAccount.create({
      data: {
        userId: user.id || "",
        phoneNumberId,
        phoneNumber,
        businessName,
        accessToken,
        status: 'active'
      }
    });

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Error connecting whatsapp account:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
