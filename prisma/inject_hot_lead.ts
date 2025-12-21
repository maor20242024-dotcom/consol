
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔥 Injecting Single HOT Lead...');

    // Get First User
    const agent = await prisma.user.findFirst();
    // Get Qualified Stage
    const pipeline = await prisma.pipeline.findFirst({ where: { isDefault: true } });
    const qualifiedStage = await prisma.stage.findFirst({ where: { pipelineId: pipeline?.id, name: 'Qualified' } }); // Assuming 'Qualified' exists
    const campaign = await prisma.campaign.findFirst();

    if (!agent || !pipeline || !qualifiedStage || !campaign) {
        console.error('❌ Missing dependencies. Run full seed first.');
        process.exit(1);
    }

    const lead = await prisma.lead.create({
        data: {
            name: 'VIP Sheikh Hamdan (Hot Test)',
            email: `vip.hamdan.${Date.now()}@test.com`,
            phone: `+97150000${Math.floor(Math.random() * 9999)}`,
            source: 'REFERRAL',
            status: 'qualified',
            pipelineId: pipeline.id,
            stageId: qualifiedStage.id,
            budget: '15000000', // HIGH BUDGET
            priority: 'HIGH',
            assignedTo: agent.id,
            campaignId: campaign.id,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });

    // Add immediate action
    await prisma.activity.create({
        data: {
            leadId: lead.id,
            type: 'NOTE',
            content: 'URGENT: Client wants to buy full floor in Downtown asap. Cash buyer.',
            isCompleted: false
        }
    });

    console.log(`✅ Injected Hot Lead: ${lead.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
