import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
    try {
        // Only admins can see cross-system analytics
        await requireAdminAuth(req);

        const [
            totalLeads,
            newLeads,
            totalCampaigns,
            activeCampaigns,
            performanceData,
            employeeStats
        ] = await Promise.all([
            prisma.lead.count(),
            prisma.lead.count({ where: { status: 'new' } }),
            prisma.campaign.count(),
            prisma.campaign.count({ where: { status: 'ACTIVE' } }),
            // Get lead creation trends for the last 7 days
            prisma.lead.groupBy({
                by: ['createdAt'],
                _count: { id: true },
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                },
                orderBy: { createdAt: 'asc' }
            }),
            // Get leads per employee
            prisma.lead.groupBy({
                by: ['assignedTo'],
                _count: { id: true }
            })
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalLeads,
                newLeads,
                totalCampaigns,
                activeCampaigns
            },
            performance: performanceData,
            employees: employeeStats
        });
    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
