
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: Request) {
    try {
        // Optional: Ensure admin access
        // await requireAuth(req, { requiredRole: 'admin' });

        const [leadsCount, usersCount, campaignsCount] = await Promise.all([
            prisma.lead.count(),
            prisma.user.count(),
            prisma.campaign.count(),
        ]);

        return NextResponse.json({
            totalLeads: leadsCount,
            totalUsers: usersCount,
            totalCampaigns: campaignsCount
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
