import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// GET: List posts
export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const posts = await prisma.instagramPost.findMany({
            where: {
                account: {
                    userId: user.id
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({ success: true, posts: posts || [] });
    } catch (error: any) {
        console.error("Error fetching instagram posts:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
