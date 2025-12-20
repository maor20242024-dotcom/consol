import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllTables() {
    console.log('🛸 Zeta Database Status Report...');
    try {
        const counts = {
            users: await prisma.user.count(),
            leads: await prisma.lead.count(),
            campaigns: await prisma.campaign.count(),
            activities: await prisma.activity.count(),
            stages: await prisma.stage.count(),
            pipelines: await prisma.pipeline.count(),
            notifications: await prisma.notification.count(),
            adCampaigns: await prisma.adCampaign.count(),
            aiRules: await prisma.aIAutoReplyRule.count(),
        };

        console.table(counts);
        console.log('✅ All core tables are visible and responding in Neon.');
    } catch (error) {
        console.error('❌ Error checking tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllTables();
