import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <main className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-yellow-500">Leads from Ads</h1>
          <p className="text-sm text-slate-400">
            آخر {leads.length} lead من صفحات الإعلان (CNN / الجزيرة / سوشال).
          </p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr className="text-left text-slate-400">
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">الهاتف</th>
              <th className="px-4 py-3">القناة</th>
              <th className="px-4 py-3">الحملة</th>
              <th className="px-4 py-3">البلد</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">تاريخ</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-2 font-medium">{lead.name}</td>
                <td className="px-4 py-2 text-slate-300 font-mono">{lead.phone}</td>
                <td className="px-4 py-2 text-slate-300">
                  {lead.marketingChannel ?? '-'}
                  {lead.pageSlug ? ` · ${lead.pageSlug}` : ''}
                </td>
                <td className="px-4 py-2 text-slate-300">
                  {lead.utmCampaign ?? '-'}
                </td>
                <td className="px-4 py-2 text-slate-300">{lead.country ?? '-'}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium
                    ${lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-300' :
                      lead.status === 'CONTACTED' ? 'bg-yellow-500/10 text-yellow-300' :
                      lead.status === 'QUALIFIED' ? 'bg-green-500/10 text-green-300' :
                      'bg-slate-500/10 text-slate-300'
                    }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-400">
                  {new Date(lead.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  لا توجد بيانات حتى الآن
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
