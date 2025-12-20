import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function forceMigration() {
    console.log('⚔️ Zeta Deployment: Strategic Asset Relocation Starting...');

    try {
        // 1. Get all leads from the backup table
        const backupLeads: any = await prisma.$queryRaw`SELECT * FROM leads_backup`;

        // 2. Identify the target location inside the Console
        const defaultPipeline = await prisma.pipeline.findFirst({
            where: { isDefault: true },
            include: { stages: { orderBy: { order: 'asc' } } }
        });

        if (!defaultPipeline || defaultPipeline.stages.length === 0) {
            console.error('❌ CRITICAL: No landing zone (Pipeline/Stage) found!');
            return;
        }

        const firstStageId = defaultPipeline.stages[0].id;

        console.log(`📡 Satellite Scan: Found ${backupLeads.length} assets to relocate.`);

        for (const lead of backupLeads) {
            // Use a unique ID based on the original ID to avoid duplicates but ensure transfer
            const targetId = `ZETA-${lead.id}`;

            try {
                await prisma.lead.upsert({
                    where: { id: targetId },
                    update: {
                        name: lead.full_name,
                        phone: lead.phone,
                        email: lead.email,
                        source: 'ALPHA_SYNC',
                        stageId: firstStageId,
                        pipelineId: defaultPipeline.id
                    },
                    create: {
                        id: targetId,
                        name: lead.full_name,
                        phone: lead.phone,
                        email: lead.email,
                        source: 'ALPHA_SYNC',
                        status: 'new',
                        stageId: firstStageId,
                        pipelineId: defaultPipeline.id
                    }
                });
                console.log(`✅ Asset Integrated: ${lead.full_name} (${targetId})`);
            } catch (err) {
                console.error(`❌ Failed to integrate ${lead.full_name}:`, err);
            }
        }

        console.log('🚀 Mission Success: All assets are now visible in the Command Center.');

    } catch (error) {
        console.error('💥 Operational Failure:', error);
    } finally {
        await prisma.$disconnect();
    }
}

forceMigration();
