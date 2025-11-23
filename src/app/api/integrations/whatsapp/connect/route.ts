import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { encrypt } from '@/lib/encryption'
import { getSupabaseUserId } from '@/lib/integration-auth'
import { z } from 'zod'

const whatsappSchema = z.object({
  userId: z.string().uuid().optional(),
  phoneNumberId: z.string().min(1),
  wabaId: z.string().min(1),
  phoneNumber: z.string().min(1),
  accessToken: z.string().min(1),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const parsed = whatsappSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(', ') }, { status: 400 })
  }

  let userId: string | null = parsed.data.userId ?? null
  if (!userId) {
    userId = await getSupabaseUserId(req)
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('whatsapp_accounts').upsert(
    {
      phone_number_id: parsed.data.phoneNumberId,
      waba_id: parsed.data.wabaId,
      phone_number: parsed.data.phoneNumber,
      name: parsed.data.name ?? null,
      access_token: encrypt(parsed.data.accessToken),
      user_id: userId,
      status: 'connected',
      webhook_verified: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'phone_number_id' },
  )

  if (error) {
    console.error('Failed to upsert WhatsApp account', error)
    return NextResponse.json({ error: 'Unable to save WhatsApp account' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'WhatsApp account connected successfully!' })
}
