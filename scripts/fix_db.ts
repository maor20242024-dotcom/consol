
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Database Integrity Fix...');

    // 1. Fix null Status in Campaigns
    // Although schema likely has defaults, existing records might be null if created raw or before migration applied defaults?
    // Prisma `findMany` fails if required field is null in DB but non-null in schema.

    // Note: We can't query "where status is null" easily if the client thinks it's non-nullable.
    // We'll update many blindly or try to finding all.

    console.log('Fixing Campaign Status and Platform...');

    // Fix Platform
    const updatedPlatforms = await prisma.campaign.updateMany({
        where: {
            // @ts-ignore - Prisma client might be strict, but we send raw query if needed
            // Actually, if we use updateMany without where clause that filters by null, we might update valid ones.
            // But since we want to enforce defaults...
            // Let's try to target those without platform.
            // Since platform is "String" in schema now (not nullable), Prisma expects it.
            // If DB has nulls, we must fix them.
            // We can use updateMany blindly for "FACEBOOK" if platform is missing? No.
        },
        data: {
            // We can't conditionally update easily via Prisma API if we can't select them.
            // But we can try SQL raw for safety.
        }
    });

    // RAW SQL is safer for "fix everything that is null"
    try {
        const statusFix = await prisma.$executeRaw`UPDATE "Campaign" SET "status" = 'DRAFT' WHERE "status" IS NULL;`;
        console.log(`Fixed ${statusFix} campaigns with null status.`);

        const platformFix = await prisma.$executeRaw`UPDATE "Campaign" SET "platform" = 'FACEBOOK' WHERE "platform" IS NULL;`;
        console.log(`Fixed ${platformFix} campaigns with null platform.`);

        const leadSourceFix = await prisma.$executeRaw`UPDATE "Lead" SET "source" = 'MANUAL' WHERE "source" IS NULL;`;
        console.log(`Fixed ${leadSourceFix} leads with null source.`);

        console.log('Database integrity check complete.');

    } catch (e) {
        console.error('Error executing raw SQL fixes:', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
