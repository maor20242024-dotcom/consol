
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration
const SIMULATION_MONTHS = 4; // Increased for depth
const TOTAL_LEADS = 60; // Increased volume

const DEVELOPERS = ['EMAAR', 'SOBHA', 'NAKHEEL', 'BINGHATTI', 'DAMAC'];
const LEAD_SOURCES = ['FACEBOOK', 'INSTAGRAM', 'GOOGLE', 'TIKTOK', 'REFERRAL', 'SNAPCHAT'];

// Map Status Strings to Stage Names
const STATUS_TO_STAGE: Record<string, string> = {
    'New': 'New Lead',
    'Contacted': 'Contacted',
    'Qualified': 'Qualified',
    'Proposal Sent': 'Proposal',
    'Negotiation': 'Negotiation',
    'Won': 'Won',
    'Lost': 'Lost'
};
const STATUS_FLOW = Object.keys(STATUS_TO_STAGE);

// Realistic Arabic Names (Expanded)
const FIRST_NAMES = [
    'Mohammed', 'Ahmed', 'Abdullah', 'Omar', 'Ali', 'Zayed', 'Hamad', 'Khalifa', 'Sultan', // GCC
    'Azad', 'Shwan', 'Dler', 'Sherzad', 'Karim', // Erbil
    'Elias', 'Sami', 'Mahmoud', 'Amal', 'Rami', 'Fadi', 'George', 'Hassan' // Arab 48 & Levant
];
const LAST_NAMES = [
    'Al-Falasi', 'Al-Kuwaiti', 'Al-Mansoori', 'Al-Kaabi', 'Al-Shamsi', 'Al-Marzooqi', // GCC
    'Barzani', 'Talabani', 'Qassab', 'Sorani', // Erbil
    'Khoury', 'Masri', 'Zoabi', 'Nassar', 'Jabareen', 'Haddad', 'Sayegh' // Arab 48 & Levant
];

// Rich Activity Templates
const NOTE_TEMPLATES = [
    "Client answered, seems interested in investment only.",
    "Called, no answer. Sent WhatsApp.",
    "Client is looking for ready properties, pushed for off-plan due to ROI.",
    "Budget is tight, suggested smaller unit.",
    "Wants to consult with wife/partner.",
    "Requested floor plans for 2BR.",
    "High potential, looking to buy within this month."
];

// Complex Chat Scripts
const CHAT_SCRIPTS = [
    {
        intent: 'General Inquiry -> Meeting',
        messages: [
            { dir: 'inbound', text: 'مرحبا، شفت اعلانكم. ممكن تفاصيل؟' },
            { dir: 'outbound', text: 'أهلاً بك. طبعاً، عندنا مشاريع مميزة. هل تبحث عن سكن أم استثمار؟' },
            { dir: 'inbound', text: 'استثمار، شي يعطيني عائد عالي.' },
            { dir: 'outbound', text: 'ممتاز. مشروع شوبا هارتلاند عليه طلب عالي. شو رأيك نحدد موعد تشوف العرض؟' },
            { dir: 'inbound', text: 'ممكن يوم السبت؟' },
            { dir: 'outbound', text: 'تم، سجلت موعدك السبت الساعة ٤ بتوقيت دبي.' }
        ]
    },
    {
        intent: 'Price Objection -> Negotiation',
        messages: [
            { dir: 'inbound', text: 'السعر غالي شوي بصراحة.' },
            { dir: 'outbound', text: 'فاهم عليك، لكن الموقع في الداون تاون ما بيخسر. وفيه خطة دفع مرنة ٥ سنوات.' },
            { dir: 'inbound', text: 'كيف يعني خطة الدفع؟' },
            { dir: 'outbound', text: 'يعني تدفع ٢٠٪ فقط مقدم والباقي أقساط. شو رأيك؟' },
            { dir: 'inbound', text: 'ممتاز، ابعتلي التفاصيل عالايميل.' }
        ]
    },
    {
        intent: 'Ready to Buy',
        messages: [
            { dir: 'outbound', text: 'مرحبا أستاذي، وصلني أنك جاهز لحجز الوحدة؟' },
            { dir: 'inbound', text: 'نعم، جهزت الشيك. متى أقدر أمر المكتب؟' },
            { dir: 'outbound', text: 'حياك الله أي وقت، أنا بانتظارك.' }
        ]
    }
];

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomItem(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function cleanDatabase() {
    console.log('🧹 Wiping Database...');
    await prisma.activity.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.instagramMessage.deleteMany({});
    await prisma.whatsappMessage.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.campaign.deleteMany({});
    await prisma.stage.deleteMany({});
    await prisma.pipeline.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✨ Database Wiped.');
}

async function main() {
    console.log('🚀 Starting Deep Interaction Simulation...');

    await cleanDatabase();

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Users
    const admin = await prisma.user.create({
        data: { name: 'Alpha Admin', email: 'admin@imperium.com', role: 'admin', password: hashedPassword }
    });
    const khaled = await prisma.user.create({
        data: { name: 'Khaled Kayyal', email: 'khaled@imperium.com', role: 'user', password: hashedPassword }
    });
    const attaf = await prisma.user.create({
        data: { name: 'Attaf Al-Saree\'a', email: 'attaf@imperium.com', role: 'user', password: hashedPassword }
    });

    const agents = [khaled, attaf];

    // 2. Pipeline & Stages
    const pipeline = await prisma.pipeline.create({
        data: { name: 'Standard Sales Pipeline', isDefault: true }
    });

    const stageNames = ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    const stages: Record<string, string> = {};

    for (let i = 0; i < stageNames.length; i++) {
        const stage = await prisma.stage.create({
            data: { name: stageNames[i], order: i, pipelineId: pipeline.id, color: '#000000' }
        });
        stages[stageNames[i]] = stage.id;
    }

    // 3. Campaigns
    const campaignInstagram = await prisma.campaign.create({
        data: { name: 'Instagram Luxury Ads', status: 'ACTIVE', platform: 'INSTAGRAM', objective: 'LEADS', userId: admin.id }
    });
    const campaignGoogle = await prisma.campaign.create({
        data: { name: 'Google Search - Dubai Real Estate', status: 'ACTIVE', platform: 'GOOGLE', objective: 'LEADS', userId: admin.id }
    });

    const campaigns = [campaignInstagram, campaignGoogle];

    // 4. Generate Leads with Deep History
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - SIMULATION_MONTHS);
    const now = new Date();

    console.log(`🏭 Generating ${TOTAL_LEADS} Leads with deep history...`);

    for (let i = 0; i < TOTAL_LEADS; i++) {
        const isRecent = Math.random() > 0.8;
        const creationDate = isRecent ? randomDate(new Date(now.getTime() - 5 * 24 * 3600 * 1000), now) : randomDate(startDate, now);

        const assignedAgent = getRandomItem(agents);
        const campaign = getRandomItem(campaigns);
        const firstName = getRandomItem(FIRST_NAMES);
        const lastName = getRandomItem(LAST_NAMES);

        // Determine Scenario
        let scenario = 'NORMAL';
        let statusString = getRandomItem(STATUS_FLOW);

        if (i === 10) { scenario = 'NEGLECTED'; statusString = 'New'; }
        if (i === 20) { scenario = 'HOT_EMAAR'; statusString = 'Qualified'; }
        if (i === 30) { scenario = 'INCOMPLETE_NOTE'; }

        // Neglected Logic
        if (scenario === 'NEGLECTED') {
            creationDate.setTime(now.getTime() - 10 * 24 * 3600 * 1000);
        }

        const stageId = stages[STATUS_TO_STAGE[statusString]];
        const budget = (scenario === 'HOT_EMAAR') ? '5000000' : (Math.floor(Math.random() * 20) + 1) * 500000 + '';

        const lead = await prisma.lead.create({
            data: {
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}${i}@test.com`,
                phone: `+9715${Math.floor(Math.random() * 100000000)}`,
                source: getRandomItem(LEAD_SOURCES),
                status: statusString.toLowerCase(),
                pipelineId: pipeline.id,
                stageId: stageId,
                budget: budget,
                assignedTo: assignedAgent.id,
                campaignId: campaign.id,
                createdAt: creationDate,
                updatedAt: new Date(creationDate.getTime() + 100000) // Slightly after creation
            }
        });

        if (scenario === 'NEGLECTED') continue; // No history for neglected

        // --- Build History Chain ---
        let currentTime = new Date(creationDate.getTime() + 3600 * 1000); // Start 1hr after creation

        // 1. Initial Note
        await prisma.activity.create({
            data: {
                leadId: lead.id, type: 'NOTE', isCompleted: true, createdAt: currentTime,
                content: `Lead received from ${campaign.platform}. Assigned to ${assignedAgent.name}.`
            }
        });

        // 2. Add Interactions based on Stage Depth
        // The deeper the stage, the more history we add
        const stageIndex = stageNames.indexOf(STATUS_TO_STAGE[statusString]);

        // Add random chat history
        if (stageIndex >= 1) { // Contacted or deeper
            currentTime = new Date(currentTime.getTime() + 24 * 3600 * 1000); // Next day
            const script = getRandomItem(CHAT_SCRIPTS);
            for (const msg of script.messages) {
                currentTime = new Date(currentTime.getTime() + 5 * 60000);
                const isWhatsapp = Math.random() > 0.3; // Mostly WhatsApp
                if (isWhatsapp) {
                    await prisma.whatsappMessage.create({
                        data: {
                            leadId: lead.id, message: msg.text, direction: msg.dir.toUpperCase(), timestamp: currentTime,
                            messageId: `wamid_${Math.random()}`, phoneNumber: lead.phone || '', createdAt: currentTime
                        }
                    });
                } else {
                    await prisma.instagramMessage.create({
                        data: {
                            leadId: lead.id, message: msg.text, direction: msg.dir, timestamp: currentTime,
                            messageId: `ig_${Math.random()}`, createdAt: currentTime
                        }
                    });
                }
            }
        }

        // Add Notes/Calls
        if (stageIndex >= 2) { // Qualified
            currentTime = new Date(currentTime.getTime() + 48 * 3600 * 1000);
            await prisma.activity.create({
                data: {
                    leadId: lead.id, type: 'CALL', isCompleted: true, createdAt: currentTime,
                    content: "Detailed requirements gathering. Client wants High Floor, Burj View."
                }
            });
        }

        // Add Proposal
        if (stageIndex >= 3) { // Proposal
            currentTime = new Date(currentTime.getTime() + 24 * 3600 * 1000);
            await prisma.activity.create({
                data: {
                    leadId: lead.id, type: 'MEETING', isCompleted: true, createdAt: currentTime,
                    content: "Sent Proposal PDF (v1) via Email. Waiting for feedback."
                }
            });
        }

        // Add Negotiation
        if (stageIndex >= 4) { // Negotiation
            currentTime = new Date(currentTime.getTime() + 72 * 3600 * 1000);
            await prisma.activity.create({
                data: {
                    leadId: lead.id, type: 'CALL', isCompleted: true, createdAt: currentTime,
                    content: "Client accepted price, asking for 50/50 payment plan waiver."
                }
            });
        }

        // Add Won/Lost final note
        if (stageIndex === 5) { // Won
            await prisma.activity.create({
                data: {
                    leadId: lead.id, type: 'NOTE', isCompleted: true, createdAt: new Date(currentTime.getTime() + 24 * 3600 * 1000),
                    content: "✅ DEAL CLOSED. SPA Signed. Commission Invoice Sent."
                }
            });
        }
        if (stageIndex === 6) { // Lost
            await prisma.activity.create({
                data: {
                    leadId: lead.id, type: 'NOTE', isCompleted: true, createdAt: new Date(currentTime.getTime() + 24 * 3600 * 1000),
                    content: "❌ Client went with competitor. Reason: Better Price."
                }
            });
        }

        // Special Scenario: Incomplete Note
        if (scenario === 'INCOMPLETE_NOTE') {
            await prisma.activity.create({
                data: {
                    leadId: lead.id, type: 'NOTE', isCompleted: false, createdAt: new Date(now.getTime() - 3600 * 1000),
                    content: "Checking unit availability..."
                }
            });
        }
    }

    console.log('✅ Deep Simulation Data Injection Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
