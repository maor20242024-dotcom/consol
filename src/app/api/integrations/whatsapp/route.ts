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
    .from('whatsapp_accounts')
    .select('id,phone_number_id,waba_id,phone_number,name,status,webhook_verified,created_at')
    .order('created_at', { ascending: false })
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to fetch WhatsApp accounts', error)
    return NextResponse.json({ error: 'Failed to fetch WhatsApp accounts' }, { status: 500 })
  }

  return NextResponse.json({ success: true, accounts: data })
}
