import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getSupabaseUserId } from '@/lib/integration-auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  let userId = searchParams.get('userId')

  if (!userId) {
    userId = await getSupabaseUserId(req)
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('instagram_accounts')
    .select('id,username,name,profile_picture_url,status,last_synced_at,created_at')
    .order('created_at', { ascending: false })
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to fetch Instagram accounts', error)
    return NextResponse.json({ error: 'Failed to fetch Instagram accounts' }, { status: 500 })
  }

  return NextResponse.json({ success: true, accounts: data })
}
