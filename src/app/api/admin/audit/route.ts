import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Fetch Audit Logs
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const entityId = searchParams.get('entityId'); // Filter by specific record (Lead, etc.)

        const whereClause = entityId ? {
            details: { contains: entityId }
        } : {};

        const logs = await prisma.auditLog.findMany({
            where: whereClause,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            }
        });

        // Format for frontend
        const formattedLogs = logs.map((log: any) => ({
            id: log.id,
            action: log.action,
            details: log.details,
            user: log.user?.name || 'System', // Fallback to System if no user
            role: log.user?.role || 'SYSTEM',
            createdAt: log.createdAt
        }));

        return NextResponse.json(formattedLogs);
    } catch (error) {
        console.error('Audit Log Error:', error);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
