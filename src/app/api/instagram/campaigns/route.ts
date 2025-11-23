import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: الحصول على جميع الحملات الإعلانية
export async function GET(req: NextRequest) {
    try {
        const accountId = req.nextUrl.searchParams.get("accountId");

        let query = supabase
            .from("InstagramCampaign")
            .select("id, name")
            .order("createdAt", { ascending: false });

        if (accountId) {
            query = query.eq("accountId", accountId);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            campaigns: data || [],
            count: data?.length || 0,
        });
    } catch (error: any) {
        console.error("[INSTAGRAM_CAMPAIGNS_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch campaigns" },
            { status: 500 }
        );
    }
}

// POST: إنشاء حملة إعلانية جديدة
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { accountId, name, description, budget, targetAudience, status } =
            body;

        if (!accountId || !name) {
            return NextResponse.json(
                { error: "accountId and name are required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("InstagramCampaign")
            .insert([
                {
                    accountId,
                    name,
                    description: description || null,
                    budget: budget || 0,
                    targetAudience: targetAudience || null,
                    status: status || "draft",
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
                campaign: data,
                message: "تم إنشاء الحملة بنجاح",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("[INSTAGRAM_CAMPAIGNS_POST_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to create campaign" },
            { status: 500 }
        );
    }
}
