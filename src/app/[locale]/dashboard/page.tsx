"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";

import { useRouter, usePathname } from "next/navigation";

import { motion } from "framer-motion";

import {

  Crown, Activity, DollarSign, Target, Users, ArrowUpRight,

  Bot, Phone, Globe, Zap, BarChart3, Settings, LogOut, Menu, X,

  Sparkles, Shield, TrendingUp, Database, Bell, RefreshCw

} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import dynamic from "next/dynamic";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), { ssr: false });

export default function ImperialDashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stats, setStats] = useState({

    revenue: 8750000,

    campaigns: 24,

    leads: 1247,

    conversion: 18.7,

    aiInteractions: 4521,

    health: 97.2

  });

  const t = useTranslations("Dashboard");

  useEffect(() => {

    const interval = setInterval(() => {

      setStats(prev => ({

        revenue: prev.revenue + Math.floor(Math.random() * 80000),

        campaigns: prev.campaigns,

        leads: prev.leads + Math.floor(Math.random() * 5),

        conversion: prev.conversion,

        aiInteractions: prev.aiInteractions + Math.floor(Math.random() * 15),

        health: prev.health

      }));

    }, 6000);

    return () => clearInterval(interval);

  }, []);

  const menuItems = [

    { icon: BarChart3, label: t("overview"), active: true },

    { icon: Bot, label: t("aiAssistant"), active: false },

    { icon: Target, label: t("campaigns"), active: false },

    { icon: Phone, label: t("calls"), active: false },

    { icon: Database, label: t("data"), active: false },

    { icon: Settings, label: t("settings"), active: false },

  ];

  return (

    <div className="min-h-screen bg-background text-foreground relative overflow-hidden" dir="rtl">

      {/* Animated Background */}

      <div className="fixed inset-0 -z-10">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

        <div className="absolute inset-0 opacity-5">

          <div className="absolute inset-0" style={{

            backgroundImage: `linear-gradient(90deg, rgb(var(--foreground)/0.02) 1px, transparent 1px),

                              linear-gradient(rgb(var(--foreground)/0.02) 1px, transparent 1px)`,

            backgroundSize: "100px 100px",

          }} />

        </div>

        <FloatingDots />

      </div>

      <div className="flex h-screen">

        {/* Luxury Sidebar */}

        <motion.aside

          initial={{ x: -300 }}

          animate={{ x: sidebarOpen ? 0 : -300 }}

          className={`fixed lg:relative z-50 w-80 h-full bg-card/80 backdrop-blur-xl border-r border-border/50 shadow-2xl`}

        >

          <div className="p-8">

            {/* Logo */}

            <div className="flex items-center gap-4 mb-12">

              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/40">

                <Crown className="w-10 h-10 text-primary-foreground" />

              </div>

              <div>

                <h1 className="text-2xl font-bold text-gradient-gold">IMPERIUM GATE</h1>

                <p className="text-muted-foreground text-sm">{t("subtitle")}</p>

              </div>

            </div>

            {/* Menu */}

            <nav className="space-y-2">

              {menuItems.map((item, i) => (

                <button

                  key={i}

                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300

                    ${item.active

                      ? "bg-primary/20 border border-primary/30 text-primary shadow-lg shadow-primary/20"

                      : "hover:bg-card/50 text-muted-foreground hover:text-foreground"

                    }`}

                >

                  <item.icon className="w-6 h-6" />

                  <span className="font-medium">{item.label}</span>

                  {item.active && <Sparkles className="w-4 h-4 ml-auto text-primary" />}

                </button>

              ))}

            </nav>

            {/* Logout */}

            <div className="absolute bottom-8 left-8 right-8">

              <Button variant="outline" className="w-full glass">

                <LogOut className="w-5 h-5 ml-3" />

                {t("logout")}

              </Button>

            </div>

          </div>

        </motion.aside>

        {/* Main Content */}

        <div className="flex-1 overflow-auto">

          {/* Top Bar */}

          <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">

            <div className="flex items-center justify-between p-6">

              <div className="flex items-center gap-6">

                <Button

                  variant="ghost"

                  size="icon"

                  onClick={() => setSidebarOpen(!sidebarOpen)}

                  className="lg:hidden"

                >

                  {sidebarOpen ? <X /> : <Menu />}

                </Button>

                <h2 className="text-3xl font-bold text-gradient-gold">{t("welcome")}</h2>

              </div>

              <div className="flex items-center gap-4">

                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">

                  <Activity className="w-4 h-4 ml-2" />

                  {t("systemActive")}

                </Badge>

                <Button variant="ghost" size="icon">

                  <Bell className="w-5 h-5" />

                </Button>

                <Button variant="ghost" size="icon">

                  <RefreshCw className="w-5 h-5" />

                </Button>

              </div>

            </div>

          </header>

          <main className="p-8">

            {/* Stats Grid */}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">

              {[

                { icon: DollarSign, label: t("revenue"), value: `${(stats.revenue / 1000000).toFixed(2)}M`, change: "+12.5%", color: "text-green-400" },

                { icon: Target, label: t("campaigns"), value: stats.campaigns, change: "+3", color: "text-blue-400" },

                { icon: Users, label: t("leads"), value: stats.leads.toLocaleString("ar-AE"), change: "+187", color: "text-purple-400" },

                { icon: TrendingUp, label: t("conversion"), value: `${stats.conversion}%`, change: "+2.1%", color: "text-yellow-400" },

                { icon: Bot, label: t("aiInteractions"), value: stats.aiInteractions.toLocaleString("ar-AE"), change: "+892", color: "text-cyan-400" },

                { icon: Shield, label: t("systemHealth"), value: `${stats.health}%`, change: "stable", color: "text-green-400" },

              ].map((stat, i) => (

                <motion.div

                  key={i}

                  initial={{ y: 20, opacity: 0 }}

                  animate={{ y: 0, opacity: 1 }}

                  transition={{ delay: i * 0.1 }}

                >

                  <Card className="glass card-hover border-border/50">

                    <CardHeader className="pb-3">

                      <div className="flex items-center justify-between">

                        <stat.icon className={`w-6 h-6 ${stat.color}`} />

                        <ArrowUpRight className="w-5 h-5 text-green-400" />

                      </div>

                    </CardHeader>

                    <CardContent>

                      <p className="text-muted-foreground text-sm">{stat.label}</p>

                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>

                      <p className={`text-sm mt-2 flex items-center gap-1 ${stat.color}`}>

                        <ArrowUpRight className="w-4 h-4" />

                        {stat.change}

                      </p>

                    </CardContent>

                  </Card>

                </motion.div>

              ))}

            </div>

            {/* AI Command Center */}

            <div className="grid lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2">

                <Card className="glass h-full border-border/50">

                  <CardHeader>

                    <h3 className="text-2xl font-bold text-gradient-gold flex items-center gap-3">

                      <Bot className="w-8 h-8" />

                      {t("aiCommandCenter")}

                    </h3>

                  </CardHeader>

                  <CardContent className="space-y-6">

                    <div className="bg-card/50 rounded-2xl p-6 border border-primary/20">

                      <div className="flex items-start gap-4">

                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">

                          <Sparkles className="w-7 h-7 text-primary" />

                        </div>

                        <div>

                          <p className="text-foreground leading-relaxed">

                            {t("aiWelcome")}

                          </p>

                          <p className="text-primary mt-3 text-sm">{t("aiPrompt")}</p>

                        </div>

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      {[t("marketAnalysis"), t("investmentAdvice"), t("clientEvaluation"), t("createReport")].map((action) => (

                        <Button key={action} className="h-14 text-lg font-medium glass card-hover">

                          {action}

                        </Button>

                      ))}

                    </div>

                  </CardContent>

                </Card>

              </div>

              {/* Quick Actions */}

              <div className="space-y-6">

                <Card className="glass border-border/50">

                  <CardHeader>

                    <h3 className="text-xl font-bold text-foreground">{t("quickActions")}</h3>

                  </CardHeader>

                  <CardContent className="space-y-4">

                    <Button className="w-full h-14 justify-between text-lg">

                      {t("startCall")}

                      <Phone className="w-6 h-6" />

                    </Button>

                    <Button variant="outline" className="w-full h-14 justify-between text-lg glass">

                      {t("schedulePost")}

                      <Globe className="w-6 h-6" />

                    </Button>

                    <Button variant="outline" className="w-full h-14 justify-between text-lg glass">

                      {t("exportReport")}

                      <Zap className="w-6 h-6" />

                    </Button>

                  </CardContent>

                </Card>

                <Card className="glass border-primary/30 bg-primary/5">

                  <CardContent className="pt-6 text-center">

                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">

                      <Shield className="w-12 h-12 text-primary" />

                    </div>

                    <p className="text-2xl font-bold text-gradient-gold">99.9%</p>

                    <p className="text-muted-foreground">{t("systemSecurity")}</p>

                  </CardContent>

                </Card>

              </div>

            </div>

          </main>

        </div>

      </div>

    </div>

  );

}