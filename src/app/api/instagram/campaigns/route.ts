import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// GET: List all campaigns
export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const campaigns = await prisma.instagramCampaign.findMany({
            where: {
                account: {
                    userId: user.id
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({ success: true, campaigns: campaigns || [], count: campaigns.length });
    } catch (error: any) {
        console.error("Error fetching instagram campaigns:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// POST: Create new campaign
export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { accountId, name, description, budget, targetAudience, status, startDate, endDate } = body;

        if (!accountId || !name) {
            return NextResponse.json({ error: "accountId and name are required" }, { status: 400 });
        }

        // Verify account ownership
        const account = await prisma.instagramAccount.findUnique({ where: { id: accountId } });
        if (!account || account.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized access to account" }, { status: 403 });
        }

        const campaign = await prisma.instagramCampaign.create({
            data: {
                accountId,
                name,
                description,
                budget,
                targetAudience: targetAudience || {},
                status: status || 'draft',
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null
            }
        });

        return NextResponse.json({ success: true, campaign, message: "Campaign created successfully" }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating campaign:", error);
        return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }
}
