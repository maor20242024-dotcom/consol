"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, BarChart3, Settings, LogOut, Users, TrendingUp, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";

const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), { ssr: false });

export default function AdminPage() {
    const t = useTranslations("Dashboard");
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'ar';
    const [stats, setStats] = useState({ totalLeads: 0, totalUsers: 0, totalCampaigns: 0 });
    const [loading, setLoading] = useState(true);
    const [systemHealth, setSystemHealth] = useState(98.5);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { count: leadsCount } = await supabase.from("leads").select("*", { count: "exact", head: true });
            const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
            const { count: campaignsCount } = await supabase.from("campaigns").select("*", { count: "exact", head: true });

            setStats({
                totalLeads: leadsCount || 0,
                totalUsers: usersCount || 0,
                totalCampaigns: campaignsCount || 0
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push(`/${locale}/login`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden" dir="rtl">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
                <FloatingDots />
            </div>

            <div className="flex h-screen">
                {/* Sidebar */}
                <aside className="w-80 bg-card/80 backdrop-blur-xl border-r border-border/50 p-8 shadow-2xl">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl">
                            <Crown className="w-10 h-10 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gradient-gold">ADMIN</h1>
                            <p className="text-muted-foreground text-sm">قيصر الإمبراطورية</p>
                        </div>
                    </div>

                    <nav className="space-y-2 mb-12">
                        {[
                            { icon: BarChart3, label: "لوحة التحكم" },
                            { icon: Users, label: "العملاء" },
                            { icon: TrendingUp, label: "التقارير" },
                            { icon: Settings, label: "الإعدادات" }
                        ].map((item, i) => (
                            <button
                                key={i}
                                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all hover:bg-primary/20 hover:text-primary text-muted-foreground"
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <Button variant="outline" onClick={handleLogout} className="w-full glass">
                        <LogOut className="w-5 h-5 ml-3" />
                        تسجيل الخروج
                    </Button>
                </aside>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50 p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-gradient-gold">لوحة تحكم الإمبراطور</h2>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                ✓ جميع الأنظمة نشطة
                            </Badge>
                        </div>
                    </header>

                    <main className="p-8 space-y-8">
                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: "إجمالي العملاء", value: stats.totalLeads, color: "text-blue-400", icon: Users },
                                { label: "المستخدمين", value: stats.totalUsers, color: "text-purple-400", icon: Users },
                                { label: "الحملات", value: stats.totalCampaigns, color: "text-green-400", icon: TrendingUp },
                                { label: "صحة النظام", value: `${systemHealth}%`, color: "text-yellow-400", icon: AlertCircle }
                            ].map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <Card key={i} className="glass card-hover border-border/50">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <Icon className={`w-6 h-6 ${stat.color}`} />
                                                <span className="text-sm text-muted-foreground">{stat.label}</span>
                                            </div>
                                            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="overview" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                                <TabsTrigger value="users">المستخدمين</TabsTrigger>
                                <TabsTrigger value="campaigns">الحملات</TabsTrigger>
                                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <Card className="glass border-border/50">
                                    <CardHeader>
                                        <CardTitle>ملخص النظام</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                                                <p className="text-muted-foreground text-sm mb-2">آخر تحديث</p>
                                                <p className="text-2xl font-bold">{new Date().toLocaleString("ar-AE")}</p>
                                            </div>
                                            <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                                                <p className="text-muted-foreground text-sm mb-2">إصدار النظام</p>
                                                <p className="text-2xl font-bold">v1.0.0</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="users">
                                <Card className="glass border-border/50">
                                    <CardHeader>
                                        <CardTitle>إدارة المستخدمين</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">سيتم إضافة جدول المستخدمين قريباً...</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="campaigns">
                                <Card className="glass border-border/50">
                                    <CardHeader>
                                        <CardTitle>إدارة الحملات</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">سيتم إضافة جدول الحملات قريباً...</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings">
                                <Card className="glass border-border/50">
                                    <CardHeader>
                                        <CardTitle>الإعدادات</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                                            <p className="font-medium mb-2">الإعدادات العامة</p>
                                            <p className="text-sm text-muted-foreground">سيتم إضافة خيارات الإعدادات قريباً...</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </div>
        </div>
    );
}
