import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
const appSecret = process.env.META_APP_SECRET
const metaVersion = process.env.META_API_VERSION || 'v19.0'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge || '', { status: 200 })
  }

  return new NextResponse('Webhook verification failed', { status: 403 })
}

function verifySignature(rawBody: string, signature?: string): boolean {
  if (!appSecret) {
    console.warn('META_APP_SECRET missing, skipping signature verification')
    return true
  }

  if (!signature) {
    console.warn('Missing x-hub-signature-256 header on webhook')
    return false
  }

  const hmac = crypto.createHmac('sha256', appSecret)
  hmac.update(rawBody)
  const expected = `sha256=${hmac.digest('hex')}`
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  if (expectedBuffer.length !== signatureBuffer.length) {
    return false
  }
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256') || undefined

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Signature mismatch' }, { status: 403 })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch (error) {
    console.error('Invalid webhook payload', error)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (payload.object === 'instagram' && Array.isArray(payload.entry)) {
    for (const entry of payload.entry) {
      const igAccountId = entry.id
      const igAccountResponse = await admin
        .from('instagram_accounts')
        .select('id,user_id')
        .eq('ig_user_id', igAccountId)
        .maybeSingle()

      if (!igAccountResponse.data) {
        continue
      }

      const messaging = entry.messaging ?? []
      for (const update of messaging) {
        const message = update.message
        if (!message || typeof message.text?.body !== 'string') {
          continue
        }

        await admin.from('instagram_dms').insert({
          instagram_account_id: igAccountResponse.data.id,
          sender_id: update.sender?.id ?? '',
          recipient_id: update.recipient?.id ?? igAccountId,
          message: message.text.body,
          sent_at: new Date().toISOString(),
        })
      }
    }
  }

  if (payload.object === 'whatsapp_business_account' && Array.isArray(payload.entry)) {
    for (const entry of payload.entry) {
      const changes = entry.changes ?? []
      for (const change of changes) {
        if (change.field !== 'messages' || !change.value) {
          continue
        }

        const metadata = change.value.metadata
        const phoneNumberId = metadata?.phone_number_id
        if (!phoneNumberId) {
          continue
        }

        const whatsappAccount = await admin
          .from('whatsapp_accounts')
          .select('id,user_id')
          .eq('phone_number_id', phoneNumberId)
          .maybeSingle()

        if (!whatsappAccount.data) {
          continue
        }

        for (const message of change.value.messages ?? []) {
          if (message.type !== 'text' || !message.text?.body) {
            continue
          }

          await admin.from('whatsapp_messages').insert({
            whatsapp_account_id: whatsappAccount.data.id,
            sender_id: message.from,
            recipient_id: phoneNumberId,
            message: message.text.body,
            sent_at: new Date().toISOString(),
          })
        }
      }
    }
  }

  return NextResponse.json({ success: true })
}
