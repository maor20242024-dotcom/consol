
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Connecting to Database...');

    try {
        const models = [
            'user',
            'lead',
            'campaign',
            'adSet',
            'ad',
            'pipeline',
            'stage',
            'channel',
            'conversation',
            'message',
            'instagramPost',
            'notification'
        ];

        console.log('\n📊 Database Report:\n');
        console.log('| Model | Count | Status |');
        console.log('|---|---|---|');

        for (const model of models) {
            try {
                // @ts-ignore
                const count = await prisma[model].count();
                console.log(`| ${model} | ${count} | ✅ OK |`);
            } catch (e: any) {
                console.log(`| ${model} | - | ❌ Error: ${e.message} |`);
            }
        }

    } catch (error) {
        console.error('❌ Fatal DB Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
