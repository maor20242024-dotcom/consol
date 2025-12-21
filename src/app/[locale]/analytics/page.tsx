"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Eye, MousePointer, Target, DollarSign, Download, Share2, TrendingUp, BarChart3, PieChart as PieChartIcon, Loader2, Sparkles, Crown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getAnalyticsData } from "@/actions/analytics";
import { Badge } from "@/components/ui/badge";

const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), { ssr: false });

export default function AnalyticsPage() {
    const t = useTranslations("Analytics");
    const locale = useLocale();
    const isArabic = locale === "ar";
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        const result = await getAnalyticsData();
        if (result.success) {
            setData(result);
        }
        setLoading(false);
    };

    const CHART_COLORS = [
        '#D4AF37', // Gold
        '#4F46E5', // Indigo
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#EC4899', // Pink
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-white/40 font-black tracking-widest uppercase text-xs">SYNCHRONIZING Zeta CORE...</p>
            </div>
        );
    }

    const { stats, chartData, sources, metrics } = data || { stats: {}, chartData: [], sources: [], metrics: [] };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 relative overflow-hidden" dir={isArabic ? "rtl" : "ltr"}>
            {/* Liquid Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <FloatingDots />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary via-primary/80 to-primary/40 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] border border-white/10 rotate-3">
                            <Sparkles className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">{t("title")}</h1>
                            <p className="text-xs font-black text-primary/40 uppercase tracking-[0.4em] mt-1">{t("subtitle")}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 rounded-2xl h-12 px-6 font-black text-[10px] tracking-widest uppercase items-center gap-2">
                            <Download className="w-4 h-4 text-primary" /> {t("export")}
                        </Button>
                        <Button variant="outline" className="border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 rounded-2xl h-12 px-6 font-black text-[10px] tracking-widest uppercase items-center gap-2">
                            <Share2 className="w-4 h-4 text-primary" /> {t("share")}
                        </Button>
                    </div>
                </header>

                {/* KPI Cockpit */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: t("impressions"), value: stats.totalImpressions || 0, color: "from-blue-500/20 to-transparent", icon: Eye, accent: "text-blue-400" },
                        { label: t("clicks"), value: stats.totalClicks || 0, color: "from-primary/20 to-transparent", icon: MousePointer, accent: "text-primary" },
                        { label: t("conversions"), value: stats.totalConversions || 0, color: "from-green-500/20 to-transparent", icon: Target, accent: "text-green-400" },
                        { label: t("spend"), value: `$${(stats.totalSpend || 0).toFixed(2)}`, color: "from-yellow-500/20 to-transparent", icon: DollarSign, accent: "text-yellow-400" }
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={i} className="bg-white/[0.03] border-white/[0.05] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all duration-500">
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <CardContent className="p-8 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.accent}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{stat.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black tracking-tighter text-white">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                                        <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Intelligence Center */}
                <Tabs defaultValue="trends" className="space-y-8">
                    <TabsList className="flex w-full bg-white/[0.02] border border-white/[0.05] p-2 rounded-[2rem] backdrop-blur-xl">
                        <TabsTrigger value="trends" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all gap-2">
                            <TrendingUp className="w-4 h-4" /> {t("trends")}
                        </TabsTrigger>
                        <TabsTrigger value="comparison" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all gap-2">
                            <PieChartIcon className="w-4 h-4" /> {t("comparison")}
                        </TabsTrigger>
                        <TabsTrigger value="details" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all gap-2">
                            <BarChart3 className="w-4 h-4" /> {t("details")}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="trends" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10 pb-0">
                                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    {t("performanceOverTime")}
                                    <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[9px] font-black tracking-widest ml-2">Real-time Sync</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 pt-4 h-[450px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis
                                            dataKey="day"
                                            stroke="rgba(255,255,255,0.3)"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.3)"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0b1026",
                                                border: "1px solid rgba(212,175,55,0.2)",
                                                borderRadius: "1rem",
                                                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
                                            }}
                                            itemStyle={{ fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}
                                        />
                                        <Area type="monotone" dataKey="leads" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#goldGradient)" />
                                        <Area type="monotone" dataKey="clicks" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#blueGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="comparison" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                <CardHeader className="p-10 pb-0">
                                    <CardTitle className="text-xl font-black tracking-tight">{t("leadsBySource")}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-10 h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={sources}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={8}
                                                dataKey="count"
                                                nameKey="source"
                                            >
                                                {sources.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(255,255,255,0.05)" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#0b1026", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem" }}
                                                itemStyle={{ fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                <CardHeader className="p-10 pb-0">
                                    <CardTitle className="text-xl font-black tracking-tight">{t("detailedMetrics")}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-10 space-y-6">
                                    {metrics.map((metric: any, i: number) => (
                                        <div key={i} className="group p-6 bg-white/[0.03] rounded-3xl border border-white/[0.05] flex items-center justify-between hover:border-primary/20 transition-all duration-300">
                                            <div>
                                                <p className="font-black text-[10px] uppercase tracking-widest text-white/40 mb-1">{metric.label}</p>
                                                <p className="text-[9px] font-black text-primary/30 uppercase tracking-tighter">{metric.benchmark}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <p className="text-2xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">{metric.value}</p>
                                                <Badge className="bg-green-500/10 text-green-400 border-none text-[8px] font-black">EXCELLENT</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10">
                                <CardTitle className="text-2xl font-black tracking-tight">Acquisition Funnel</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#0b1026", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "1rem" }}
                                            cursor={{ fill: 'rgba(212,175,55,0.05)' }}
                                        />
                                        <Bar dataKey="spend" fill="#D4AF37" radius={[10, 10, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
