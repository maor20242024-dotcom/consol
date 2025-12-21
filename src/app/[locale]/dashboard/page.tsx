import dynamicImport from "next/dynamic";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { prisma } from "@/lib/db";
import {
    Activity,
    BarChart3,
    TrendingUp,
    Users,
    Target,
    Phone,
    Bot,
    Sparkles,
    Shield,
    Zap
} from "lucide-react";

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

        const totalSpendData = await prisma.instagramAd.aggregate({
            _sum: {
                spend: true,
            },
        });

        const totalSpend = totalSpendData._sum.spend || 0;

        return {
            systemHealth: 98.5,
            campaigns: campaignCount,
            leads: leadCount,
            ads: adCount,
            totalSpend: totalSpend.toString(),
        };
    } catch (error) {
        console.error("[DASHBOARD_STATS_ERROR]", error);
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
    const t = await getTranslations({ locale, namespace: "Dashboard" });
    const stats = await getDashboardStats();

    const panels = [
        {
            label: t("systemHealth"),
            value: `${stats.systemHealth}%`,
            detail: t("healthDetail"),
            icon: Shield,
            color: "text-blue-400"
        },
        {
            label: t("campaignsLabel"),
            value: `${stats.campaigns} ${t("active")}`,
            detail: t("campaignsDetail"),
            icon: Target,
            color: "text-primary"
        },
        {
            label: t("leadsLabel"),
            value: stats.leads.toLocaleString(),
            detail: t("pipelineDetail", { amount: stats.leads }),
            icon: Users,
            color: "text-emerald-400"
        },
        {
            label: t("adsLabel"),
            value: stats.ads.toString(),
            detail: t("adsDetail"),
            icon: Sparkles,
            color: "text-amber-400"
        },
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden p-6 lg:p-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.1),transparent_50%)]" />
            <FloatingDotsClient />

            <PageShell
                title={t("title")}
                description={t("description")}
                variant="gradient"
            >
                {/* Top Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {panels.map((panel) => (
                        <div key={panel.label} className="glass group relative overflow-hidden p-6 rounded-[2rem] border border-primary/10 hover:border-primary/30 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <panel.icon className="w-12 h-12" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-black mb-2 flex items-center gap-2">
                                    <panel.icon className={`w-3 h-3 ${panel.color}`} />
                                    {panel.label}
                                </p>
                                <p className="text-4xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">
                                    {panel.value}
                                </p>
                                <p className="text-sm font-medium text-muted-foreground/80 mt-2">
                                    {panel.detail}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Live Pulse Panel */}
                    <div className="glass rounded-[2.5rem] p-8 border border-blue-500/10 shadow-[0_0_50px_rgba(30,58,138,0.1)]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
                                    <Activity className="w-6 h-6 text-primary animate-pulse" />
                                    {t("pulseTitle")}
                                </h3>
                                <p className="text-xs font-semibold text-muted-foreground mt-1">{t("pulseDetail")}</p>
                            </div>
                            <div className="px-3 py-1 bg-primary/20 border border-primary/20 rounded-full">
                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold animate-pulse">LIVE FEED</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: t("pulseChannels.aiAssistant"), status: "Armed", icon: Bot },
                                { name: t("pulseChannels.voiceCenter"), status: "Ready", icon: Phone },
                                { name: t("pulseChannels.campaigns"), status: "Deploying", icon: TrendingUp },
                                { name: t("pulseChannels.crm"), status: "Synced", icon: Target },
                            ].map((item) => (
                                <div
                                    key={item.name}
                                    className="group flex items-center justify-between rounded-3xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] transition-all p-5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                            <item.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <p className="text-sm font-black tracking-tight text-white/90">{item.name}</p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Intel Panel */}
                    <div className="glass lg:col-span-2 rounded-[2.5rem] p-8 border border-primary/10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-blue-500/20">
                                <BarChart3 className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter text-white">{t("operationalTitle")}</h3>
                                <p className="text-sm font-medium text-muted-foreground">{t("operationalDetail")}</p>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3 mt-8">
                            {[
                                {
                                    level: t("immediateLabel"),
                                    note: t("immediateDesc"),
                                    icon: Zap,
                                    color: "border-red-500/30 bg-red-500/5 text-red-400"
                                },
                                {
                                    level: t("nextLabel"),
                                    note: t("nextDesc"),
                                    icon: TrendingUp,
                                    color: "border-primary/30 bg-primary/10 text-primary"
                                },
                                {
                                    level: t("laterLabel"),
                                    note: t("laterDesc"),
                                    icon: Activity,
                                    color: "border-blue-500/30 bg-blue-500/10 text-blue-400"
                                },
                            ].map((item) => (
                                <div key={item.level} className={`rounded-[2rem] border ${item.color} p-8 flex flex-col justify-between h-48 hover:scale-[1.02] transition-transform`}>
                                    <div className="flex items-center justify-between">
                                        <item.icon className="w-6 h-6 opacity-50" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{item.level}</p>
                                    </div>
                                    <p className="text-lg font-black tracking-tight leading-tight">{item.note}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Sparkles className="w-5 h-5 text-primary animate-bounce" />
                                <p className="text-sm font-bold text-white/80">AI Suggestion: Increase budget for High-Net-Worth leads in Jumeirah.</p>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Execute Strategy</button>
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
                <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                </div>
            }
        >
            <DashboardContent params={params} />
        </Suspense>
    );
}
