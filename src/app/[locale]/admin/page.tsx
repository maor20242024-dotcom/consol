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
    const t = useTranslations("Admin");
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'en';
    const [stats, setStats] = useState({ totalLeads: 0, totalUsers: 0, totalCampaigns: 0 });
    const [loading, setLoading] = useState(true);
    const [healthStatus, setHealthStatus] = useState<any[]>([]);
    const [checkingHealth, setCheckingHealth] = useState(false);

    useEffect(() => {
        loadStats();
        checkSystemHealth();
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

    const checkSystemHealth = async () => {
        setCheckingHealth(true);
        try {
            const res = await fetch("/api/health");
            const data = await res.json();
            setHealthStatus(data.results || []);
        } catch (error) {
            console.error("Health check failed:", error);
            setHealthStatus([]);
        } finally {
            setCheckingHealth(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push(`/${locale}/login`);
    };

    // Safely calculate overall health
    const safeHealthStatus = Array.isArray(healthStatus) ? healthStatus : [];
    const overallHealth = safeHealthStatus.every(s => s.status === "operational") ? 100 :
        safeHealthStatus.some(s => s.status === "down") ? 50 : 80;

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
                                    <h2 className="text-2xl font-bold text-gradient-gold">{t("title")}</h2>
                                    <p className="text-xs text-muted-foreground">{t("description")}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={checkSystemHealth} disabled={checkingHealth}>
                                    {checkingHealth ? "Checking..." : "Run Health Check"}
                                </Button>
                                <Badge className={`${overallHealth === 100 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"} border-current`}>
                                    {overallHealth === 100 ? `✓ ${t("active")}` : "⚠ Issues Detected"}
                                </Badge>
                            </div>
                        </div>
                    </header>

                    <main className="space-y-8">
                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: "CRM", value: stats.totalLeads, color: "text-blue-400", icon: Users },
                                { label: t("users"), value: stats.totalUsers, color: "text-primary", icon: Users },
                                { label: "Campaigns", value: stats.totalCampaigns, color: "text-green-400", icon: TrendingUp },
                                { label: t("systemHealth"), value: `${overallHealth}%`, color: "text-yellow-400", icon: AlertCircle }
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
                                <TabsTrigger value="overview">{t("systemHealth")}</TabsTrigger>
                                <TabsTrigger value="users">{t("users")}</TabsTrigger>
                                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                                <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <Card className="glass border-border/50">
                                    <CardHeader>
                                        <CardTitle>{t("systemHealth")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {safeHealthStatus.map((status, i) => (
                                                <div key={i} className="p-4 bg-card/50 rounded-xl border border-border/50 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{status.service}</p>
                                                        {status.message && <p className="text-xs text-muted-foreground">{status.message}</p>}
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={status.status === "operational" ? "default" : "destructive"}>
                                                            {status.status}
                                                        </Badge>
                                                        {status.latency && <p className="text-xs text-muted-foreground mt-1">{status.latency}ms</p>}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                                                <p className="text-muted-foreground text-sm mb-2">{t("logs")}</p>
                                                <p className="text-2xl font-bold">{new Date().toLocaleString(locale === "ar" ? "ar-AE" : "en-US")}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="users">
                                <Card className="glass border-border/50">
                                    <CardHeader>
                                        <CardTitle>{t("users")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border border-border/50">
                                            <div className="grid grid-cols-5 p-4 bg-muted/50 font-medium text-sm">
                                                <div>Name</div>
                                                <div>Email</div>
                                                <div>Role</div>
                                                <div>Status</div>
                                                <div>Actions</div>
                                            </div>
                                            <div className="p-8 text-center text-muted-foreground text-sm">
                                                User management features coming soon...
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="campaigns">
                                <Card className="glass border-border/50">
                                    <CardHeader>
                                        <CardTitle>Campaigns Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                    <p className="text-sm text-green-500 mb-1">Active Campaigns</p>
                                                    <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
                                                </div>
                                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                                    <p className="text-sm text-blue-500 mb-1">Total Spend</p>
                                                    <p className="text-2xl font-bold">$0.00</p>
                                                </div>
                                                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                                    <p className="text-sm text-purple-500 mb-1">Total Leads</p>
                                                    <p className="text-2xl font-bold">{stats.totalLeads}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="w-full" onClick={() => router.push(`/${locale}/campaigns`)}>
                                                Go to Campaign Manager
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings">
                                <Card className="glass border-border/50">
                                    <CardHeader>
                                        <CardTitle>{t("settings")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">General Settings</h3>
                                            <div className="grid gap-4">
                                                <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">System Language</p>
                                                        <p className="text-sm text-muted-foreground">Default language for new users</p>
                                                    </div>
                                                    <Badge variant="outline">English</Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Theme</p>
                                                        <p className="text-sm text-muted-foreground">System appearance</p>
                                                    </div>
                                                    <Badge variant="outline">Dark / Gold</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Integrations</h3>
                                            <div className="grid gap-4">
                                                <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">f</div>
                                                        <div>
                                                            <p className="font-medium">Facebook / Instagram</p>
                                                            <p className="text-sm text-muted-foreground">Connected</p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                                                </div>
                                            </div>
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
