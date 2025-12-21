
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting Zeta AI Data Cleanup...');

    // Delete Leads first
    const deleteLeads = await prisma.lead.deleteMany({
        where: {
            OR: [
                { email: { endsWith: '@test.com' } },
                { name: { contains: '(Zeta Test)' } }
            ]
        }
    });
    console.log(`Deleted ${deleteLeads.count} Test Leads.`);

    // Delete Users
    const deleteUsers = await prisma.user.deleteMany({
        where: {
            email: { in: ['khaled@imperium.com', 'attaf@imperium.com'] }
        }
    });
    console.log(`Deleted ${deleteUsers.count} Test Users.`);

    console.log('✨ Cleanup Complete. Database is clean.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
