'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Eye, MousePointer, Target, DollarSign, Download, Share2 } from "lucide-react";
import { useLocale } from "next-intl";
import { PageShell } from "@/components/page-shell";

const FloatingDotsClient = dynamic(
    () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
    { ssr: false }
);

export default function AnalyticsPage() {
    const locale = useLocale();
    const isArabic = locale === "ar";
    const [chartData, setChartData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalSpend: 0,
    });
    const [metrics, setMetrics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch analytics data from API (will connect to Prisma via backend)
                // For now, using sample data
                setChartData([
                    { day: "Mon", impressions: 2400, clicks: 1398, conversions: 240, spend: 2210 },
                    { day: "Tue", impressions: 1398, clicks: 9800, conversions: 2290, spend: 2290 },
                    { day: "Wed", impressions: 9800, clicks: 3908, conversions: 2000, spend: 2000 },
                    { day: "Thu", impressions: 3908, clicks: 4800, conversions: 2181, spend: 2500 },
                    { day: "Fri", impressions: 4800, clicks: 3800, conversions: 2500, spend: 2100 },
                    { day: "Sat", impressions: 3800, clicks: 4300, conversions: 2100, spend: 2300 },
                    { day: "Sun", impressions: 4300, clicks: 3000, conversions: 2300, spend: 1900 },
                ]);
                setStats({
                    totalImpressions: 30297,
                    totalClicks: 31698,
                    totalConversions: 16942,
                    totalSpend: 16320,
                });
                setMetrics([
                    { label: "Click-Through Rate", value: "4.48%", benchmark: "Industry: 4.2%" },
                    { label: "Conversion Rate", value: "5.35%", benchmark: "Industry: 2.8%" },
                    { label: "Cost Per Click", value: "$0.51", benchmark: "Industry: $1.20" },
                    { label: "Cost Per Acquisition", value: "$0.96", benchmark: "Industry: $42.86" },
                ]);
            } catch (error) {
                console.error("[ANALYTICS_ERROR]", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div
            className="min-h-screen bg-background p-6 relative overflow-hidden"
            dir={isArabic ? "rtl" : "ltr"}
        >
            <FloatingDotsClient />
            <div className="max-w-7xl mx-auto relative z-10">
                <PageShell
                    title={isArabic ? "التحليلات" : "Analytics"}
                    subtitle={isArabic ? "إحصائيات شاملة" : "Overall Performance"}
                    showBackButton
                    backHref={`/${locale}/dashboard`}
                    variant="gradient"
                    actions={
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-2">
                                <Download className="w-4 h-4" />
                                {isArabic ? "تحميل" : "Export"}
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                                <Share2 className="w-4 h-4" />
                                {isArabic ? "مشاركة" : "Share"}
                            </Button>
                        </div>
                    }
                >

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            icon: Eye,
                            label: isArabic ? "المشاهدات" : "Impressions",
                            value: stats.totalImpressions.toLocaleString(),
                            color: "text-blue-400",
                        },
                        {
                            icon: MousePointer,
                            label: isArabic ? "النقرات" : "Clicks",
                            value: stats.totalClicks.toLocaleString(),
                            color: "text-primary",
                        },
                        {
                            icon: Target,
                            label: isArabic ? "التحويلات" : "Conversions",
                            value: stats.totalConversions.toLocaleString(),
                            color: "text-green-400",
                        },
                        {
                            icon: DollarSign,
                            label: isArabic ? "الإنفاق" : "Spend",
                            value: `$${stats.totalSpend.toFixed(2)}`,
                            color: "text-yellow-400",
                        },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={i} className="bg-slate-800/50 border-primary/20 backdrop-blur">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <Icon className={`w-8 h-8 ${stat.color}`} />
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Charts */}
                <Tabs defaultValue="line" className="space-y-6">
                    <TabsList className="bg-slate-700/50">
                        <TabsTrigger value="line">{isArabic ? "الاتجاهات" : "Trends"}</TabsTrigger>
                        <TabsTrigger value="bar">{isArabic ? "المقارنة" : "Comparison"}</TabsTrigger>
                        <TabsTrigger value="metrics">{isArabic ? "التفاصيل" : "Details"}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="line">
                        <Card className="bg-slate-800/50 border-primary/20 backdrop-blur">
                            <CardHeader>
                                <CardTitle>
                                    {isArabic ? "الأداء على مدى الوقت" : "Performance Over Time"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!loading && chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="day" stroke="#999" />
                                            <YAxis stroke="#999" />
                                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #D4AF37" }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="impressions" stroke="#D4AF37" strokeWidth={2} />
                                            <Line type="monotone" dataKey="clicks" stroke="#E5C158" strokeWidth={2} />
                                            <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[300px] text-gray-400">
                                        {isArabic ? "جاري التحميل..." : "Loading..."}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bar">
                        <Card className="bg-slate-800/50 border-primary/20 backdrop-blur">
                            <CardHeader>
                                <CardTitle>{isArabic ? "مقارنة المقاييس" : "Metrics Comparison"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!loading && chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="day" stroke="#999" />
                                            <YAxis stroke="#999" />
                                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #D4AF37" }} />
                                            <Legend />
                                            <Bar dataKey="impressions" fill="#D4AF37" />
                                            <Bar dataKey="clicks" fill="#E5C158" />
                                            <Bar dataKey="conversions" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[300px] text-gray-400">
                                        {isArabic ? "جاري التحميل..." : "Loading..."}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="metrics">
                        <Card className="bg-slate-800/50 border-primary/20 backdrop-blur">
                            <CardHeader>
                                <CardTitle>
                                    {isArabic ? "المقاييس التفصيلية" : "Detailed Metrics"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {metrics.map((metric, i) => (
                                    <div key={i} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-medium">{metric.label}</p>
                                            <p className="text-gray-400 text-sm">{metric.benchmark}</p>
                                        </div>
                                        <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                            {metric.value}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                </PageShell>
            </div>
        </div>
    );
}
