import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: الحصول على تحليلات الحملة
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // campaignId
        const dateRange = req.nextUrl.searchParams.get("days") || "30";
        const days = parseInt(dateRange);

        // جلب جميع الإعلانات في الحملة
        const { data: ads, error: adsError } = await supabase
            .from("InstagramAd")
            .select("id")
            .eq("campaignId", id);

        if (adsError) {
            return NextResponse.json({ error: adsError.message }, { status: 500 });
        }

        const adIds = ads?.map((ad) => ad.id) || [];

        if (adIds.length === 0) {
            return NextResponse.json({
                success: true,
                campaign_id: id,
                totalImpressions: 0,
                totalClicks: 0,
                totalConversions: 0,
                totalSpend: 0,
                avgCTR: 0,
                avgCPC: 0,
                ads: [],
                performance: [],
            });
        }

        // جلب بيانات الأداء الإجمالية
        const { data: performance } = await supabase
            .from("AdPerformance")
            .select("*")
            .in("adId", adIds)
            .gte("date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
            .order("date", { ascending: true });

        // جلب تفاصيل الإعلانات
        const { data: adDetails } = await supabase
            .from("InstagramAd")
            .select("*")
            .eq("campaignId", id);

        // حساب الإجماليات
        const totals = {
            impressions: adDetails?.reduce((sum, ad) => sum + ad.impressions, 0) || 0,
            clicks: adDetails?.reduce((sum, ad) => sum + ad.clicks, 0) || 0,
            conversions:
                adDetails?.reduce((sum, ad) => sum + ad.conversions, 0) || 0,
            spend: adDetails?.reduce((sum, ad) => sum + parseFloat(ad.spend), 0) || 0,
        };

        const avgCTR =
            totals.impressions > 0
                ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
                : "0";
        const avgCPC =
            totals.clicks > 0 ? (totals.spend / totals.clicks).toFixed(2) : "0";

        return NextResponse.json({
            success: true,
            campaign_id: id,
            totalImpressions: totals.impressions,
            totalClicks: totals.clicks,
            totalConversions: totals.conversions,
            totalSpend: totals.spend.toFixed(2),
            avgCTR: parseFloat(avgCTR),
            avgCPC: parseFloat(avgCPC),
            adsCount: adDetails?.length || 0,
            ads: adDetails || [],
            performance: performance || [],
            dateRange: {
                days,
                from: new Date(
                    Date.now() - days * 24 * 60 * 60 * 1000
                ).toISOString(),
                to: new Date().toISOString(),
            },
        });
    } catch (error: any) {
        console.error("[ANALYTICS_CAMPAIGN_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch campaign analytics" },
            { status: 500 }
        );
    }
}
