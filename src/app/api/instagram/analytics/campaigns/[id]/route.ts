import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await requireAuth(req);
        if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params;

        // Verify Campaign Ownership
        const campaign = await prisma.instagramCampaign.findUnique({
            where: { id },
            include: { account: true, ads: true }
        });

        if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        if (campaign.account?.userId !== user.id && user.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        // Fetch Performance Data (Mock logic or real if table populated)
        // Aggregating ad performance
        const ads = await prisma.instagramAd.findMany({
            where: { campaignId: id },
            include: {
                performance: {
                    orderBy: { date: 'desc' },
                    take: 30
                }
            }
        });

        // Calculate totals
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalSpend = 0;
        let totalConversions = 0;

        ads.forEach(ad => {
            ad.performance.forEach(p => {
                totalImpressions += p.impressions;
                totalClicks += p.clicks;
                totalSpend += Number(p.spend);
                totalConversions += p.conversions;
            });
        });

        return NextResponse.json({
            success: true,
            analytics: {
                summary: {
                    impressions: totalImpressions,
                    clicks: totalClicks,
                    spend: totalSpend,
                    conversions: totalConversions
                },
                ads: ads.map(ad => ({
                    id: ad.id,
                    headline: ad.headline,
                    status: ad.status,
                    impressions: ad.impressions, // Assuming these fields are updated on Ad model too or just recalc
                    clicks: ad.clicks,
                    spend: Number(ad.spend)
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching campaign analytics:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
