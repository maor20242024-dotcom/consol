
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    const leads = await prisma.lead.findMany();
    const campaigns = await prisma.campaign.findMany();
    const pipelines = await prisma.pipeline.findMany();
    const stages = await prisma.stage.findMany();
    const activities = await prisma.activity.findMany();
    const notifications = await prisma.notification.findMany();

    const data = {
        users,
        leads,
        campaigns,
        pipelines,
        stages,
        activities,
        notifications,
        exportedAt: new Date().toISOString()
    };

    const outputPath = path.join(process.cwd(), 'database_dump.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Database dump saved to ${outputPath}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
