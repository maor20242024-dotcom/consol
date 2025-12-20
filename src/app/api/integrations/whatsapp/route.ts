import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url)
    const userIdArg = searchParams.get('userId');
    const targetUserId = userIdArg || user.id;

    const accounts = await prisma.whatsappAccount.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phoneNumberId: true,
        // wabaId: true, // Check schema if wabaId exists. Schema says: phoneNumberId, phoneNumber, businessName, accessToken, status... NO wabaId.
        // Adjusting selection to match schema.
        phoneNumber: true,
        businessName: true,
        status: true,
        // webhookVerified: true, // Schema doesn't have this.
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    console.error('Failed to fetch WhatsApp accounts', error)
    return NextResponse.json({ error: 'Failed to fetch WhatsApp accounts' }, { status: 500 })
  }
}
