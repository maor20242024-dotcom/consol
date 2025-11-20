import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: الحصول على تفاصيل حملة محددة
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("InstagramCampaign")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        // جلب الإعلانات المرتبطة بهذه الحملة
        const { data: ads, error: adsError } = await supabase
            .from("InstagramAd")
            .select("*")
            .eq("campaignId", id);

        return NextResponse.json({
            success: true,
            campaign: data,
            ads: ads || [],
        });
    } catch (error: any) {
        console.error("[INSTAGRAM_CAMPAIGN_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch campaign" },
            { status: 500 }
        );
    }
}

// PUT: تحديث حملة
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const { data, error } = await supabase
            .from("InstagramCampaign")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            campaign: data,
            message: "تم تحديث الحملة بنجاح",
        });
    } catch (error: any) {
        console.error("[INSTAGRAM_CAMPAIGN_PUT_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update campaign" },
            { status: 500 }
        );
    }
}

// DELETE: حذف حملة
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("InstagramCampaign")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "تم حذف الحملة بنجاح",
        });
    } catch (error: any) {
        console.error("[INSTAGRAM_CAMPAIGN_DELETE_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to delete campaign" },
            { status: 500 }
        );
    }
}
