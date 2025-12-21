
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Zeta AI Verification Seed...');

    // 1. Create Test Employees
    const khaled = await prisma.user.upsert({
        where: { email: 'khaled@imperium.com' },
        update: {},
        create: {
            email: 'khaled@imperium.com',
            name: 'Khaled Kayyal',
            role: 'user',
            password: 'password123', // Dummy
        },
    });

    const attaf = await prisma.user.upsert({
        where: { email: 'attaf@imperium.com' },
        update: {},
        create: {
            email: 'attaf@imperium.com',
            name: 'Attaf Al-Saree\'a',
            role: 'user',
            password: 'password123',
        },
    });

    console.log('✅ Employees Created:', khaled.name, attaf.name);

    // 2. Scenario 1: Neglected Lead (Khaled)
    // Created 5 days ago, No touch since.
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 5);

    const leadNeglected = await prisma.lead.create({
        data: {
            name: 'Mr. Neglected (Zeta Test)',
            phone: '+971500000001',
            email: 'neglected@test.com',
            source: 'FACEBOOK',
            status: 'New',
            assignedTo: khaled.id,
            createdAt: oldDate,
            updatedAt: oldDate,
            activities: {
                create: {
                    type: 'NOTE',
                    content: 'Initial inquiry received.',
                    createdAt: oldDate,
                }
            }
        }
    });

    // 3. Scenario 2: Incomplete Note (Khaled)
    // Agent left a note but didn't finish/schedule next step.
    const leadIncomplete = await prisma.lead.create({
        data: {
            name: 'Mr. Incomplete (Zeta Test)',
            phone: '+971500000002',
            email: 'incomplete@test.com',
            source: 'INSTAGRAM',
            status: 'Contacted',
            assignedTo: khaled.id,
            activities: {
                create: {
                    type: 'NOTE',
                    content: 'Customer is asking about payment plans for Sobha.',
                    isCompleted: false, // Flag!
                }
            }
        }
    });

    // 4. Scenario 3: Hot Lead / Market Context (Attaf)
    // High budget, asking for key developers.
    const leadHot = await prisma.lead.create({
        data: {
            name: 'Ms. Hot Investor (Zeta Test)',
            phone: '+971500000003',
            email: 'hot@test.com',
            source: 'WEBSITE',
            status: 'Qualified',
            budget: '5000000', // 5M AED
            assignedTo: attaf.id,
            activities: {
                create: {
                    type: 'NOTE',
                    content: 'Looking for a luxury apartment in Downtown. Likes Emaar.',
                    isCompleted: true,
                }
            }
        }
    });

    // 5. Scenario 4: Cold Lead / Rejection (Attaf)
    const leadCold = await prisma.lead.create({
        data: {
            name: 'Mr. Cold (Zeta Test)',
            phone: '+971500000004',
            email: 'cold@test.com',
            source: 'REFERRAL',
            status: 'Lost',
            assignedTo: attaf.id,
            activities: {
                create: {
                    type: 'NOTE',
                    content: 'Says properties are too expensive. Not interested.',
                    isCompleted: true,
                }
            }
        }
    });

    console.log('✅ Scenarios Injected:');
    console.log(`- Neglected Lead ID: ${leadNeglected.id} (Should trigger "Missing Follow-up")`);
    console.log(`- Incomplete Lead ID: ${leadIncomplete.id} (Should trigger "Incomplete Note")`);
    console.log(`- Hot Lead ID: ${leadHot.id} (Should trigger "Emaar Strategy")`);
    console.log(`- Cold Lead ID: ${leadCold.id}`);

    console.log('🏁 Seed Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
