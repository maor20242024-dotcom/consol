import { z } from 'zod'

export const leadIntakeSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  message: z.string().max(2000).optional(),

  country: z.string().optional(),
  investmentGoal: z.string().optional(),
  language: z.enum(['ar', 'en']).optional(),

  marketingChannel: z.string().optional(),
  pageSlug: z.string().optional(),

  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),

  landingPath: z.string().optional(),
  referer: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),

  isWhatsappPreferred: z.boolean().optional(),
  budgetRange: z.string().optional(),
  timeToInvest: z.string().optional(),
})

export type LeadIntakePayload = z.infer<typeof leadIntakeSchema>

export function normalizePhone(phone: string) {
  // إزالة كل شيء غير أرقام
  const digits = phone.replace(/[^\d]/g, '')
  // لو رقم دولي طويل نخليه كما هو، ولو قصير نتركه أيضاً
  return digits
}
