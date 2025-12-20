
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function dumpData() {
    console.log('🔄 Starting full database dump...');

    const models = [
        'user',
        'lead',
        'pipeline',
        'stage',
        'activity',
        'call',
        'campaign',
        'adSet',
        'ad',
        'insight',
        'instagramAccount',
        'instagramPost',
        'instagramCampaign',
        'instagramAd',
        'adAsset',
        'adVariant',
        'adPerformance',
        'channel',
        'conversation',
        'message',
        'instagramMessage',
        'whatsappAccount',
        'whatsappMessage',
        'aIAssistant',
        'aIConversation',
        'aIConversationMessage',
        'adCampaign',
        'adCreative',
        'aIAutoReplyRule'
    ];

    const data: Record<string, any> = {};

    for (const modelName of models) {
        try {
            // @ts-ignore - Dynamic access to prisma models
            if (prisma[modelName]) {
                console.log(`📦 Fetching ${modelName}...`);
                // @ts-ignore
                const records = await prisma[modelName].findMany();
                data[modelName] = records;
                console.log(`   ✅ ${modelName}: ${records.length} records`);
            } else {
                console.warn(`   ⚠️ Model ${modelName} not found on prisma client instance.`);
            }
        } catch (error) {
            console.error(`   ❌ Error fetching ${modelName}:`, error);
            data[modelName] = { error: String(error) };
        }
    }

    const outputPath = path.join(process.cwd(), 'database_dump.json');
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));

    console.log(`\n🎉 Database dump complete! saved to: ${outputPath}`);

    // Also print a summary table
    console.table(
        Object.entries(data).map(([model, records]) => ({
            Model: model,
            Count: Array.isArray(records) ? records.length : 'ERROR'
        }))
    );
}

dumpData()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
