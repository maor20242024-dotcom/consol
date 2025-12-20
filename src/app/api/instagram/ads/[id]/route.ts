import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await requireAuth(req);
        if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const ad = await prisma.instagramAd.findUnique({
            where: { id: params.id },
            include: {
                assets: true,
                variants: true,
                performance: {
                    take: 30,
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!ad) {
            return NextResponse.json({ error: "Ad not found" }, { status: 404 });
        }

        // Verify ownership (Ads -> Account -> User)
        // Optimization: checking via accountId
        if (ad.accountId) {
            const account = await prisma.instagramAccount.findUnique({ where: { id: ad.accountId } });
            if (account?.userId !== user.id && user.role !== 'admin') {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        return NextResponse.json({
            success: true,
            ad,
            assets: ad.assets || [],
            variants: ad.variants || [],
            performance: ad.performance || []
        });
    } catch (error) {
        console.error("Error fetching ad:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await requireAuth(req);
        const { id } = params;
        const body = await req.json();

        // Verify ownership
        const existing = await prisma.instagramAd.findUnique({
            where: { id },
            include: { account: true }
        });

        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (existing.account?.userId !== user.id && user.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const ad = await prisma.instagramAd.update({
            where: { id },
            data: body
        });

        return NextResponse.json({ success: true, ad, message: "Ad updated" });
    } catch (error) {
        console.error("Error updating ad:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await requireAuth(req);
        const { id } = params;

        // Verify ownership
        const existing = await prisma.instagramAd.findUnique({
            where: { id },
            include: { account: true }
        });

        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (existing.account?.userId !== user.id && user.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        await prisma.instagramAd.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Ad deleted" });
    } catch (error) {
        console.error("Error deleting ad:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
