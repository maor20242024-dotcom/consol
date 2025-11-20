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
    const locale = pathname.split('/')[1] || 'en';
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
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden" dir={locale === "ar" ? "rtl" : "ltr"}>
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
                <FloatingDots />
            </div>

            <div className="flex-1 overflow-auto">
                {/* Main Content */}
                <div className="p-8">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50 pb-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                                    <Crown className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gradient-gold">Admin Dashboard</h2>
                                    <p className="text-xs text-muted-foreground">{locale === "ar" ? "قيصر الإمبراطورية" : "System Administrator"}</p>
                                </div>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                ✓ {locale === "ar" ? "جميع الأنظمة نشطة" : "All Systems Active"}
                            </Badge>
                        </div>
                    </header>

                    <main className="space-y-8">
                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: "إجمالي العملاء", value: stats.totalLeads, color: "text-blue-400", icon: Users },
                                { label: "المستخدمين", value: stats.totalUsers, color: "text-primary", icon: Users },
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
