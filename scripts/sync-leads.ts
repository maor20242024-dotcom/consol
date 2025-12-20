import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function syncLeads() {
    console.log('🛸 Zeta Intelligence: Starting Lead Synchronization from Backup to Primary Vault...');

    try {
        // 1. Fetch from leads_backup using raw query since it's not in our primary schema
        const backupLeads: any = await prisma.$queryRaw`SELECT * FROM leads_backup`;

        console.log(`📡 Found ${backupLeads.length} leads in the backup vault.`);

        // 2. Find default pipeline/stage to put them in
        const defaultPipeline = await prisma.pipeline.findFirst({
            where: { isDefault: true },
            include: { stages: { orderBy: { order: 'asc' }, take: 1 } }
        });

        if (!defaultPipeline) {
            console.error('❌ Error: No default pipeline found in the Primary Vault!');
            return;
        }

        const stageId = defaultPipeline.stages[0]?.id;

        for (const lead of backupLeads) {
            // Check if already exists in Lead table (by phone or email)
            const existing = await prisma.lead.findFirst({
                where: {
                    OR: [
                        { phone: lead.phone },
                        { email: lead.email }
                    ]
                }
            });

            if (!existing) {
                await prisma.lead.create({
                    data: {
                        name: lead.full_name || 'Legacy Lead',
                        phone: lead.phone,
                        email: lead.email,
                        source: 'LEGACY_SYNC',
                        status: 'new',
                        pipelineId: defaultPipeline.id,
                        stageId: stageId,
                        budget: lead.payload?.budget?.toString() || null,
                    }
                });
                console.log(`✅ Successfully transferred: ${lead.full_name}`);
            } else {
                console.log(`⏩ Skipping ${lead.full_name} - Already exists in Primary Vault.`);
            }
        }

        console.log('🚀 Mission Accomplished: All backup leads have been integrated into Zeta Console.');
    } catch (error) {
        console.error('❌ Sync Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncLeads();
