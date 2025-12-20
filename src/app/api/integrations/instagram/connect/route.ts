import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accessToken, instagramUserId, instagramUsername, businessAccountId } = await req.json();

    if (!accessToken || !instagramUserId) {
      return NextResponse.json({ error: "Missing required Token or User ID" }, { status: 400 });
    }

    // Create or Update Account
    const account = await prisma.instagramAccount.upsert({
      where: { instagramUserId },
      update: {
        accessToken,
        status: 'active',
        lastSyncedAt: new Date()
      },
      create: {
        userId: user.id,
        instagramUserId,
        instagramUsername: instagramUsername || "Unknown",
        accessToken,
        businessAccountId: businessAccountId || "unknown", // Schema requires it, assume we get it or placeholder
        status: 'active'
      }
    });

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Error connecting instagram account:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
