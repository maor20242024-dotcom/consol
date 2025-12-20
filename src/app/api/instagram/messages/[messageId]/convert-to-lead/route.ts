import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// POST: Convert message to lead
export async function POST(req: NextRequest, props: { params: Promise<{ messageId: string }> }) {
  const params = await props.params;
  try {
    const user = await requireAuth(req);
    if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messageId } = params;
    const { pipelineId, stageId } = await req.json();

    // 1. Fetch message and verify ownership
    const message = await prisma.instagramMessage.findUnique({
      where: { id: messageId }, // Or messageId if that's the PK. Schema says PK is 'id'.
      include: { instagramAccount: true }
    });

    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    if (message.instagramAccount?.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Check if lead exists
    if (message.leadId) {
      return NextResponse.json({ error: "Message already converted to lead" }, { status: 400 });
    }

    // 3. Create Lead
    const lead = await prisma.lead.create({
      data: {
        name: message.username || "Instagram Lead",
        source: "INSTAGRAM",
        sourcePlatform: "INSTAGRAM",
        pipelineId,
        stageId,
        status: "NEW", // Ensure consistent casing with schema enum if applicable, or string
        campaignId: message.campaignId
      }
    });

    // 4. Update Message
    await prisma.instagramMessage.update({
      where: { id: messageId },
      data: { leadId: lead.id }
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("Error converting message to lead:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
