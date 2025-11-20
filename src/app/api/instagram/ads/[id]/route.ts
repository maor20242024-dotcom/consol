import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: الحصول على تفاصيل إعلان محدد مع أدائه
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("InstagramAd")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "Ad not found" }, { status: 404 });
        }

        // جلب الأصول (صور/فيديو)
        const { data: assets } = await supabase
            .from("AdAsset")
            .select("*")
            .eq("adId", id);

        // جلب النسخ (Variants)
        const { data: variants } = await supabase
            .from("AdVariant")
            .select("*")
            .eq("adId", id);

        // جلب البيانات الأداء
        const { data: performance } = await supabase
            .from("AdPerformance")
            .select("*")
            .eq("adId", id)
            .order("date", { ascending: false })
            .limit(30);

        return NextResponse.json({
            success: true,
            ad: data,
            assets: assets || [],
            variants: variants || [],
            performance: performance || [],
        });
    } catch (error: any) {
        console.error("[INSTAGRAM_AD_GET_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch ad" }, { status: 500 });
    }
}

// PUT: تحديث إعلان
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const { data, error } = await supabase
            .from("InstagramAd")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            ad: data,
            message: "تم تحديث الإعلان بنجاح",
        });
    } catch (error: any) {
        console.error("[INSTAGRAM_AD_PUT_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update ad" },
            { status: 500 }
        );
    }
}

// DELETE: حذف إعلان
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // حذف جميع الأصول والبيانات المرتبطة تلقائياً بفضل CASCADE
        const { error } = await supabase.from("InstagramAd").delete().eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "تم حذف الإعلان بنجاح",
        });
    } catch (error: any) {
        console.error("[INSTAGRAM_AD_DELETE_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to delete ad" },
            { status: 500 }
        );
    }
}
