"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Lock, Globe, User, Zap, CreditCard, Shield } from "lucide-react";
import dynamic from "next/dynamic";
import { PageShell } from "@/components/page-shell";

const FloatingDots = dynamic(
    () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
    { ssr: false }
);

export default function SettingsPage() {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en";

    const [settings, setSettings] = useState({
        email: "admin@imperium.local",
        phone: "+971501234567",
        language: locale,
        timezone: "GST",
        notifications: {
            email: true,
            sms: true,
            push: true,
        },
        privacy: {
            profile: "public",
            analytics: true,
            dataCollection: true,
        },
    });

    return (
        <div className="min-h-screen bg-background p-6 relative overflow-hidden" dir={locale === "ar" ? "rtl" : "ltr"}>
            <FloatingDots />
            <div className="max-w-4xl mx-auto relative z-10">
                <PageShell
                    title={locale === "ar" ? "الإعدادات" : "Settings"}
                    subtitle={locale === "ar" ? "إدارة تفضيلاتك" : "Manage your preferences"}
                    showBackButton
                    variant="gradient"
                >
                    <Tabs defaultValue="general" className="space-y-6">
                        <TabsList className="bg-slate-700/50 w-full justify-start">
                            <TabsTrigger value="general" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {locale === "ar" ? "عام" : "General"}
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                {locale === "ar" ? "التنبيهات" : "Notifications"}
                            </TabsTrigger>
                            <TabsTrigger value="privacy" className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {locale === "ar" ? "الخصوصية" : "Privacy"}
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                {locale === "ar" ? "الأمان" : "Security"}
                            </TabsTrigger>
                        </TabsList>

                        {/* General Settings */}
                        <TabsContent value="general">
                            <Card className="bg-slate-800/50 border-primary/20 backdrop-blur space-y-6">
                                <CardHeader>
                                    <CardTitle>{locale === "ar" ? "الإعدادات العامة" : "General Settings"}</CardTitle>
                                    <CardDescription>{locale === "ar" ? "معلومات حسابك الأساسية" : "Your basic account information"}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 block mb-2">
                                            {locale === "ar" ? "البريد الإلكتروني" : "Email Address"}
                                        </label>
                                        <Input value={settings.email} disabled className="bg-slate-700/50 border-slate-600" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 block mb-2">
                                            {locale === "ar" ? "رقم الهاتف" : "Phone Number"}
                                        </label>
                                        <Input
                                            value={settings.phone}
                                            className="bg-slate-700/50 border-slate-600"
                                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 block mb-2">
                                            {locale === "ar" ? "اللغة" : "Language"}
                                        </label>
                                        <select
                                            value={settings.language}
                                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                                        >
                                            <option value="en">English</option>
                                            <option value="ar">العربية</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 block mb-2">
                                            {locale === "ar" ? "المنطقة الزمنية" : "Timezone"}
                                        </label>
                                        <select
                                            value={settings.timezone}
                                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                                        >
                                            <option value="GST">GST (UAE)</option>
                                            <option value="AST">AST</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>
                                    <Button className="bg-linear-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 text-primary-foreground font-semibold">
                                        {locale === "ar" ? "حفظ التغييرات" : "Save Changes"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications */}
                        <TabsContent value="notifications">
                            <Card className="bg-slate-800/50 border-primary/20 backdrop-blur">
                                <CardHeader>
                                    <CardTitle>{locale === "ar" ? "إعدادات التنبيهات" : "Notification Settings"}</CardTitle>
                                    <CardDescription>{locale === "ar" ? "تحكم بكيفية تلقيك للإشعارات" : "Control how you receive notifications"}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { key: "email", label: locale === "ar" ? "إشعارات البريد الإلكتروني" : "Email Notifications" },
                                        { key: "sms", label: locale === "ar" ? "إشعارات SMS" : "SMS Notifications" },
                                        { key: "push", label: locale === "ar" ? "إشعارات المتصفح" : "Push Notifications" },
                                    ].map((notif) => (
                                        <div key={notif.key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                            <label className="text-white font-medium">{notif.label}</label>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications[notif.key as keyof typeof settings.notifications]}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    notifications: {
                                                        ...settings.notifications,
                                                        [notif.key]: e.target.checked
                                                    }
                                                })}
                                                className="w-5 h-5 cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Privacy */}
                        <TabsContent value="privacy">
                            <Card className="bg-slate-800/50 border-primary/20 backdrop-blur">
                                <CardHeader>
                                    <CardTitle>{locale === "ar" ? "إعدادات الخصوصية" : "Privacy Settings"}</CardTitle>
                                    <CardDescription>{locale === "ar" ? "تحكم بمشاركة بياناتك" : "Control your data sharing"}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                        <p className="text-white font-medium mb-3">{locale === "ar" ? "مستوى الملف الشخصي" : "Profile Visibility"}</p>
                                        <div className="space-y-2">
                                            {["public", "private", "team"].map((level) => (
                                                <label key={level} className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="profile"
                                                        checked={settings.privacy.profile === level}
                                                        onChange={() => setSettings({
                                                            ...settings,
                                                            privacy: {
                                                                ...settings.privacy,
                                                                profile: level
                                                            }
                                                        })}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-gray-300">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                        <label className="text-white font-medium">{locale === "ar" ? "تحليل الاستخدام" : "Usage Analytics"}</label>
                                        <input
                                            type="checkbox"
                                            checked={settings.privacy.analytics}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                privacy: {
                                                    ...settings.privacy,
                                                    analytics: e.target.checked
                                                }
                                            })}
                                            className="w-5 h-5 cursor-pointer"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security */}
                        <TabsContent value="security">
                            <Card className="bg-slate-800/50 border-primary/20 backdrop-blur">
                                <CardHeader>
                                    <CardTitle>{locale === "ar" ? "إعدادات الأمان" : "Security Settings"}</CardTitle>
                                    <CardDescription>{locale === "ar" ? "حافظ على حسابك آمناً" : "Keep your account secure"}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button variant="outline" className="w-full border-primary/20">
                                        {locale === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                                    </Button>
                                    <Button variant="outline" className="w-full border-primary/20">
                                        {locale === "ar" ? "تفعيل المصادقة الثنائية" : "Enable Two-Factor Authentication"}
                                    </Button>
                                    <Button variant="outline" className="w-full border-primary/20">
                                        {locale === "ar" ? "إدارة الأجهزة" : "Manage Devices"}
                                    </Button>
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-2">
                                            ✓ {locale === "ar" ? "تم التحقق" : "Verified"}
                                        </Badge>
                                        <p className="text-gray-300 text-sm">{locale === "ar" ? "حسابك آمن ومحمي" : "Your account is secure and protected"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </PageShell>
            </div>
        </div>
    );
}
