
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('💉 Injecting Single NEGLECTED Lead...');

    // Get First User
    const agent = await prisma.user.findFirst();
    // Get First Pipeline/Stage (New)
    const pipeline = await prisma.pipeline.findFirst({ where: { isDefault: true } });
    const newStage = await prisma.stage.findFirst({ where: { pipelineId: pipeline?.id, order: 0 } });
    const campaign = await prisma.campaign.findFirst();

    if (!agent || !pipeline || !newStage || !campaign) {
        console.error('❌ Missing dependencies (User, Pipeline, Stage, or Campaign). Run full seed first.');
        process.exit(1);
    }

    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 3600 * 1000);

    const lead = await prisma.lead.create({
        data: {
            name: 'Samir Al-Mansi (Neglected Test)',
            email: `samir.mansi.${Date.now()}@test.com`,
            phone: `+97150000${Math.floor(Math.random() * 9999)}`,
            source: 'FACEBOOK',
            status: 'new',
            pipelineId: pipeline.id,
            stageId: newStage.id,
            budget: '2000000',
            assignedTo: agent.id,
            campaignId: campaign.id,
            createdAt: tenDaysAgo, // OLD CREATION DATE
            updatedAt: tenDaysAgo  // OLD UPDATE DATE -> TRIGGER NEGLECT
        }
    });

    console.log(`✅ Injected Neglected Lead: ${lead.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
