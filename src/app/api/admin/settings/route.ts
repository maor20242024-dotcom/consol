import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Fetch all system settings
export async function GET(req: Request) {
    try {
        const settings = await prisma.systemSetting.findMany();
        // Convert array to object for easier frontend consumption
        const settingsMap = settings.reduce((acc: Record<string, any>, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        return NextResponse.json(settingsMap);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// POST: Update or Create a setting
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 });
        }

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        return NextResponse.json({ success: true, setting });
    } catch (error: any) {
        console.error('Settings Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
