import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// GET: List messages
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const messages = await prisma.instagramMessage.findMany({
      where: {
        // Only fetch messages for accounts owned by user
        instagramAccount: {
          userId: user.id
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    return NextResponse.json({ success: true, messages: messages || [] });
  } catch (error: any) {
    console.error("Error fetching instagram messages:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
