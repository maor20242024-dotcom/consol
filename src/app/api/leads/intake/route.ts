import { NextRequest, NextResponse } from 'next/server'
import { leadIntakeSchema, normalizePhone } from '@/lib/lead-intake-schema'
import { prisma } from '@/lib/prisma'

const INTAKE_SECRET = process.env.CRM_INTAKE_SECRET

export async function POST(req: NextRequest) {
  try {
    // 1) حماية بالـ secret
    const secretHeader = req.headers.get('x-imperium-secret')

    // For local development ease if secret is not set, but better to require it.
    // Assuming user wants strict check as per instructions.
    if (!INTAKE_SECRET || secretHeader !== INTAKE_SECRET) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const json = await req.json()

    // 2) validation
    const parsed = leadIntakeSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'validation_error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const data = parsed.data

    // 3) normalizing phone
    const normalizedPhone = normalizePhone(data.phone)

    // 4) البحث عن lead موجود (dedup)
    const existingLead = await prisma.lead.findFirst({
      where: {
        OR: [
          data.email
            ? { email: data.email.toLowerCase() }
            : undefined,
          { phone: { endsWith: normalizedPhone } },
        ].filter(Boolean) as any,
      },
    })

    const baseLeadData = {
      name: data.name,
      phone: normalizedPhone,
      email: data.email?.toLowerCase(),
      message: data.message,
      country: data.country,
      language: data.language,

      isWhatsappPreferred: data.isWhatsappPreferred ?? false,
      budgetRange: data.budgetRange,
      timeToInvest: data.timeToInvest,
      investmentGoal: data.investmentGoal,

      marketingChannel: data.marketingChannel,
      pageSlug: data.pageSlug,

      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmTerm: data.utmTerm,
      utmContent: data.utmContent,

      landingPath: data.landingPath,
      referer: data.referer,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    }

    let lead
    let isNew = false

    if (existingLead) {
      // 5) تحديث lead قديم ببعض المعلومات الجديدة (لو كانت فارغة)
      lead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          ...baseLeadData,
          name: existingLead.name || baseLeadData.name,
          message: baseLeadData.message ?? existingLead.message,
        },
      })
    } else {
      // 6) إنشاء lead جديد
      isNew = true
      lead = await prisma.lead.create({
        data: baseLeadData,
      })
    }

    // 7) تسجيل event للـ submission
    // Note: Since we are using SQLite and simplified schema without Json type, we JSON.stringify the meta
    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        type: 'FORM_SUBMITTED',
        description: `Lead submitted from ${data.marketingChannel ?? 'unknown'} / ${
          data.pageSlug ?? 'unknown'
        }`,
        meta: JSON.stringify(data),
      },
    })

    return NextResponse.json({ ok: true, leadId: lead.id, isNew })
  } catch (err) {
    console.error('Lead intake error', err)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
