import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {
    console.log('🛸 Zeta Command: Seeding Authorized Personnel with Encrypted Vaults...');

    // 🔐 Initial Global Password for Command Staff
    const defaultPassword = 'Imperiumgate2025';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const users = [
        {
            email: 'office@imperiumgate.com',
            name: 'Super Admin',
            role: 'superadmin',
            password: hashedPassword,
            isActive: true,
        },
        {
            email: 'nouran@imperiumgate.com',
            name: 'Nouran Admin',
            role: 'admin',
            password: hashedPassword,
            isActive: true,
        },
    ];

    for (const userData of users) {
        try {
            const user = await prisma.user.upsert({
                where: { email: userData.email },
                update: {
                    name: userData.name,
                    role: userData.role,
                    password: userData.password,
                    isActive: userData.isActive,
                },
                create: {
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    password: userData.password,
                    isActive: userData.isActive,
                },
            });
            console.log(`✅ User ${user.email} synchronized and secured with encrypted password.`);
        } catch (error) {
            console.error(`❌ Failed to sync user ${userData.email}:`, error);
        }
    }

    await prisma.$disconnect();
    console.log('🚀 Seeding complete. Vaults are locked. Staff is active.');
    console.log(`📢 ATTENTION ALPHA: Default password is: ${defaultPassword}`);
}

seedUsers();
