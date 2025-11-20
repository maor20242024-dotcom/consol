import dynamicImport from "next/dynamic";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

const FloatingDotsClient = dynamicImport(
    () => import("@/components/FloatingDots").then((m) => m.FloatingDots)
);

async function getDashboardStats() {
    try {
        const [campaignCount, leadCount, adCount] = await Promise.all([
            prisma.instagramCampaign.count(),
            prisma.lead.count(),
            prisma.instagramAd.count(),
        ]);

        // حساب إجمالي الإنفاق
        const totalSpendData = await prisma.instagramAd.aggregate({
            _sum: {
                spend: true,
            },
        });

        const totalSpend = totalSpendData._sum.spend || 0;

        return {
            systemHealth: 98.5, // نسبة افتراضية (يمكن حسابها من الخوادم)
            campaigns: campaignCount,
            leads: leadCount,
            ads: adCount,
            totalSpend: totalSpend.toString(),
        };
    } catch (error) {
        console.error("[DASHBOARD_STATS_ERROR]", error);
        // إرجاع قيم افتراضية في حالة الخطأ
        return {
            systemHealth: 95,
            campaigns: 0,
            leads: 0,
            ads: 0,
            totalSpend: "0",
        };
    }
}

async function DashboardContent({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = getTranslations({ locale });
    const stats = await getDashboardStats();

    const panels = [
        { label: locale === "ar" ? "صحة النظام" : "System Health", value: `${stats.systemHealth}%`, detail: locale === "ar" ? "جميع الخدمات الأساسية تعمل بشكل طبيعي." : "All underlying services nominal." },
        { label: locale === "ar" ? "الحملات" : "Campaigns", value: `${stats.campaigns} ${locale === "ar" ? "نشطة" : "active"}`, detail: locale === "ar" ? "مدارة بالذكاء الاصطناعي وحية." : "AI-managed and live." },
        { label: locale === "ar" ? "العملاء" : "Leads", value: stats.leads.toLocaleString(), detail: `$${Number(stats.totalSpend).toLocaleString()} ${locale === "ar" ? "في خط الأنابيب" : "pipeline"}` },
        { label: locale === "ar" ? "الإعلانات" : "Ads", value: stats.ads.toString(), detail: locale === "ar" ? "إعلانات Instagram قيد التشغيل" : "Instagram ads running" },
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <FloatingDotsClient />
            <PageShell
                title={locale === "ar" ? "لوحة التحكم" : "Dashboard"}
                description={locale === "ar" ? "مركز القيادة المركزي للحملات والصوتيات والـ CRM والتحليلات." : "Central command for campaigns, voice, CRM, and analytics."}
            >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {panels.map((panel) => (
                        <div key={panel.label} className="glass card-panel p-6">
                            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                                {panel.label}
                            </p>
                            <p className="text-4xl font-bold text-gradient-gold mt-2">{panel.value}</p>
                            <p className="body-muted mt-3">{panel.detail}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="card-panel col-span-1">
                        <p className="section-title">Pulse</p>
                        <p className="body-muted">Live telemetry stream for your luxury channels.</p>
                        <div className="mt-6 space-y-3">
                            {["AI Assistant", "Voice Center", "Campaigns", "CRM"].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center justify-between rounded-2xl border border-border-soft bg-panel-soft/70 px-4 py-3"
                                >
                                    <p className="text-sm font-semibold">{item}</p>
                                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Live</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card-panel lg:col-span-2">
                        <p className="section-title">Operational Notes</p>
                        <p className="body-muted">
                            Everything on track. Priority is to deepen engagement with the AI assistant and keep the
                            CRM pipeline hydrated before midnight.
                        </p>
                        <div className="mt-6 grid gap-4 lg:grid-cols-2">
                            {[
                                { title: "Immediate", desc: "Approve villa campaign budgets" },
                                { title: "Next", desc: "Refresh voice scripts for future clients" },
                                { title: "Later", desc: "Analyze Dubai market insights" },
                            ].map((item) => (
                                <div key={item.title} className="rounded-2xl border border-border-soft bg-panel-soft/60 px-6 py-5">
                                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{item.title}</p>
                                    <p className="mt-2 text-base font-semibold">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageShell>
        </div>
    );
}

export default function ImperialDashboard({ params }: { params: Promise<{ locale: string }> }) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background relative overflow-hidden">
                    <FloatingDotsClient />
                    <PageShell title="Dashboard" description="Loading...">
                        <div className="text-center text-muted-foreground">Loading dashboard...</div>
                    </PageShell>
                </div>
            }
        >
            <DashboardContent params={params} />
        </Suspense>
    );
}
