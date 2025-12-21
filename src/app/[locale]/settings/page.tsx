"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Lock, Globe, User, Shield, Radio, Cpu, Save, Loader2, Crown } from "lucide-react";
import dynamic from "next/dynamic";
import { getSettingsData, updateUserSettings, updateSystemSettings } from "@/actions/settings";
import { useToast } from "@/hooks/use-toast";

const FloatingDots = dynamic(
    () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
    { ssr: false }
);

export default function SettingsPage() {
    const t = useTranslations("Settings");
    const locale = useLocale();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userSettings, setUserSettings] = useState<any>({});
    const [systemSettings, setSystemSettings] = useState<any>({});

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const result = await getSettingsData();
        if (result.success) {
            setUser(result.user);
            setUserSettings(result.user.settings || {});
            setSystemSettings(result.systemSettings || {});
        }
        setLoading(false);
    };

    const handleSaveUserSettings = async () => {
        setSaving(true);
        const result = await updateUserSettings(userSettings);
        if (result.success) {
            toast({ title: t("success") });
        } else {
            toast({ variant: "destructive", title: t("error") });
        }
        setSaving(false);
    };

    const handleUpdateSystemSetting = async (key: string, value: any) => {
        const result = await updateSystemSettings(key, value);
        if (result.success) {
            setSystemSettings({ ...systemSettings, [key]: value });
            toast({ title: t("success") });
        } else {
            toast({ variant: "destructive", title: t("error") });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-white/40 font-black tracking-widest uppercase text-xs">SYNCHRONIZING Zeta CORE...</p>
            </div>
        );
    }

    const isAdmin = user?.role === "admin" || user?.role === "superadmin";

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 relative overflow-hidden" dir={locale === "ar" ? "rtl" : "ltr"}>
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <FloatingDots />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 relative z-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary via-primary/80 to-primary/40 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] border border-white/10 rotate-3">
                            <Crown className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">{t("title")}</h1>
                            <p className="text-xs font-black text-primary/40 uppercase tracking-[0.4em] mt-1">{t("subtitle")}</p>
                        </div>
                    </div>
                </header>

                <Tabs defaultValue="account" className="space-y-8">
                    <TabsList className="bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-[2rem] backdrop-blur-xl w-full flex overflow-x-auto no-scrollbar">
                        <TabsTrigger value="account" className="flex-1 rounded-2xl h-11 font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all gap-2">
                            <User className="w-3.5 h-3.5" /> {t("account")}
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex-1 rounded-2xl h-11 font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all gap-2">
                            <Bell className="w-3.5 h-3.5" /> {t("notifications")}
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="flex-1 rounded-2xl h-11 font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all gap-2">
                            <Shield className="w-3.5 h-3.5" /> {t("privacy")}
                        </TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger value="system" className="flex-1 rounded-2xl h-11 font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all gap-2">
                                <Cpu className="w-3.5 h-3.5" /> {t("system")}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Account Settings */}
                    <TabsContent value="account" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8">
                                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                                    {t("account")}
                                    <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[8px] font-black">{user?.role}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">{t("email")}</label>
                                        <Input value={user?.email} disabled className="bg-white/[0.03] border-white/5 rounded-2xl h-12 text-white/40" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">{t("phone")}</label>
                                        <Input
                                            value={userSettings.phone || ""}
                                            onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
                                            className="bg-white/[0.03] border-white/10 rounded-2xl h-12 hover:border-primary/50 focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">{t("language")}</label>
                                        <select
                                            value={userSettings.language || locale}
                                            onChange={(e) => setUserSettings({ ...userSettings, language: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl h-12 px-4 appearance-none outline-none focus:border-primary transition-colors text-sm"
                                        >
                                            <option value="en" className="bg-[#020617]">English</option>
                                            <option value="ar" className="bg-[#020617]">العربية</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">{t("timezone")}</label>
                                        <select
                                            value={userSettings.timezone || "GST"}
                                            onChange={(e) => setUserSettings({ ...userSettings, timezone: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl h-12 px-4 appearance-none outline-none focus:border-primary transition-colors text-sm"
                                        >
                                            <option value="GST" className="bg-[#020617]">GST (UAE)</option>
                                            <option value="AST" className="bg-[#020617]">AST</option>
                                            <option value="UTC" className="bg-[#020617]">UTC</option>
                                        </select>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSaveUserSettings}
                                    disabled={saving}
                                    className="bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {t("saveChanges")}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications */}
                    <TabsContent value="notifications" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[2.5rem]">
                            <CardHeader className="p-8">
                                <CardTitle className="text-xl font-black tracking-tight">{t("notifications")}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                {[
                                    { id: "email", label: "Email Alerts" },
                                    { id: "sms", label: "SMS Pulse" },
                                    { id: "push", label: "Neural Desktop" }
                                ].map((n) => (
                                    <div key={n.id} className="flex items-center justify-between p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:border-primary/20 transition-all">
                                        <span className="font-black text-xs uppercase tracking-widest text-white/60">{n.label}</span>
                                        <div
                                            onClick={() => setUserSettings({
                                                ...userSettings,
                                                notifications: { ...userSettings.notifications, [n.id]: !userSettings.notifications?.[n.id] }
                                            })}
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${userSettings.notifications?.[n.id] ? "bg-primary" : "bg-white/10"}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${userSettings.notifications?.[n.id] ? "translate-x-6" : "translate-x-0"}`} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* System Core - ADMIN ONLY */}
                    {isAdmin && (
                        <TabsContent value="system" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Card className="md:col-span-2 bg-red-500/[0.02] border-red-500/10 backdrop-blur-3xl rounded-[2.5rem]">
                                    <CardHeader className="p-8">
                                        <CardTitle className="text-xl font-black tracking-tight text-red-500 flex items-center gap-2">
                                            <Lock className="w-5 h-5" /> {t("alphaOnly")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-red-500/40 uppercase tracking-widest block">{t("crmEndpoint")}</label>
                                                <Input
                                                    defaultValue={systemSettings.crm_endpoint || ""}
                                                    onBlur={(e) => handleUpdateSystemSetting("crm_endpoint", e.target.value)}
                                                    className="bg-white/[0.03] border-red-500/10 rounded-2xl h-12 text-red-100"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-red-500/40 uppercase tracking-widest block">{t("crmApiKey")}</label>
                                                <Input
                                                    type="password"
                                                    defaultValue={systemSettings.crm_api_key || ""}
                                                    onBlur={(e) => handleUpdateSystemSetting("crm_api_key", e.target.value)}
                                                    className="bg-white/[0.03] border-red-500/10 rounded-2xl h-12 text-red-100"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-red-500/40 uppercase tracking-widest block">{t("systemMode")}</label>
                                                <div className="flex gap-4">
                                                    {["STEALTH", "ACTIVE", "MAINTENANCE"].map((m) => (
                                                        <button
                                                            key={m}
                                                            onClick={() => handleUpdateSystemSetting("operation_mode", m)}
                                                            className={`flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${systemSettings.operation_mode === m ? "bg-red-500 border-red-500 text-white" : "bg-white/5 border-white/5 text-white/40 hover:border-red-500/30"}`}
                                                        >
                                                            {m}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="space-y-8">
                                    <Card className="bg-white/[0.02] border-white/[0.05] rounded-[2.5rem] p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Radio className="w-6 h-6 animate-pulse" />
                                            </div>
                                            <div>
                                                <p className="font-black text-xs uppercase tracking-widest">Core Status</p>
                                                <p className="text-[9px] text-white/40 uppercase">Global Sync Active</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-white/30 leading-relaxed font-medium">
                                            Any changes made in the Alpha console affect global response patterns and API integrations immediately. Proceed with absolute certainty.
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
