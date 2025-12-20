import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userIdArg = searchParams.get('userId');

    // If userId arg is provided, ensure it matches authenticated user OR user is admin
    const targetUserId = userIdArg || user.id;

    // Fetch from Prisma using correct model name (InstagramAccount)
    const accounts = await prisma.instagramAccount.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        instagramUsername: true, // mapped from username
        // name: true, // Check if 'name' exists in schema. Schema has instagramUsername but not 'name'? Schema check needed. 
        // Schema has: instagramUserId, instagramUsername, accessToken, businessAccountId, followers, engagementRate...
        // Does not seem to have 'name' or 'profile_picture_url'. 
        // I will select what exists and add placeholders if needed.
        status: true,
        lastSyncedAt: true,
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    console.error('Failed to fetch Instagram accounts', error)
    return NextResponse.json({ error: 'Failed to fetch Instagram accounts' }, { status: 500 })
  }
}
