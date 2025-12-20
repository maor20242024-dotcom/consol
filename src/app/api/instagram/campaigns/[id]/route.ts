import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await requireAuth(req);
        if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const campaign = await prisma.instagramCampaign.findUnique({
            where: { id: params.id },
            include: {
                ads: true
            }
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        // Verify ownership
        const account = await prisma.instagramAccount.findUnique({ where: { id: campaign.accountId } });
        if (account?.userId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            campaign,
            ads: campaign.ads || []
        });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await requireAuth(req);
        const { id } = params;
        const body = await req.json();

        // Verify ownership first
        const existing = await prisma.instagramCampaign.findUnique({
            where: { id },
            include: { account: true }
        });

        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (existing.account.userId !== user.id && user.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const campaign = await prisma.instagramCampaign.update({
            where: { id },
            data: body
        });

        return NextResponse.json({ success: true, campaign, message: "Campaign updated" });
    } catch (error) {
        console.error("Error updating campaign:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await requireAuth(req);
        const { id } = params;

        // Verify ownership first
        const existing = await prisma.instagramCampaign.findUnique({
            where: { id },
            include: { account: true }
        });

        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (existing.account.userId !== user.id && user.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        await prisma.instagramCampaign.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Campaign deleted" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
