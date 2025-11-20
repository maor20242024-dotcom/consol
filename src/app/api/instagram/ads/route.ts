import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: الحصول على جميع الإعلانات
export async function GET(req: NextRequest) {
    try {
        const campaignId = req.nextUrl.searchParams.get("campaignId");
        const status = req.nextUrl.searchParams.get("status");

        let query = supabase
            .from("InstagramAd")
            .select("*")
            .order("createdAt", { ascending: false });

        if (campaignId) {
            query = query.eq("campaignId", campaignId);
        }

        if (status) {
            query = query.eq("status", status);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            ads: data || [],
            count: data?.length || 0,
        });
    } catch (error: any) {
        console.error("[INSTAGRAM_ADS_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch ads" },
            { status: 500 }
        );
    }
}

// POST: إنشاء إعلان جديد
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            accountId,
            campaignId,
            headline,
            description,
            callToAction,
            adType,
        } = body;

        if (!accountId || !campaignId || !headline || !description) {
            return NextResponse.json(
                {
                    error:
                        "accountId, campaignId, headline, and description are required",
                },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("InstagramAd")
            .insert([
                {
                    accountId,
                    campaignId,
                    headline,
                    description,
                    callToAction: callToAction || "SHOP_NOW",
                    adType: adType || "image",
                    status: "draft",
                },
            ])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            {
                success: true,
                ad: data,
                message: "تم إنشاء الإعلان بنجاح",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("[INSTAGRAM_ADS_POST_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to create ad" },
            { status: 500 }
        );
    }
}
