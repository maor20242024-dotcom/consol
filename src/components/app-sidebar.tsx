"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Crown, BarChart3, Bot, Target, Phone, Database,
  Globe, Sparkles, TrendingUp, Settings, LogOut, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function AppSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  const navigateTo = (path: string) => {
    router.push(`/${locale}/${path}`);
  };

  const menuItems = [
    { icon: BarChart3, labelKey: "overview", path: 'dashboard' },
    { icon: Bot, labelKey: "aiAssistant", path: 'ai-assistant' },
    { icon: Target, labelKey: "campaigns", path: 'crm' },
    { icon: Phone, labelKey: "calls", path: 'voice' },
    { icon: Database, labelKey: "data", path: 'admin' },
    { icon: Globe, labelKey: "adManager", path: 'campaigns-manager' },
    { icon: Sparkles, labelKey: "adCreator", path: 'ad-creator' },
    { icon: TrendingUp, labelKey: "analytics", path: 'analytics' },
    { icon: Settings, labelKey: "settings", path: 'settings' },
  ];

  const isActive = (path: string) => {
    if (path === 'dashboard') {
      return pathname === `/${locale}` || pathname === `/${locale}/dashboard`;
    }
    return pathname.includes(`/${locale}/${path}`);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden"
      >
        {sidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: sidebarOpen ? 0 : 320 }}
        animate={{ x: sidebarOpen ? 0 : 320 }}
        transition={{ duration: 0.3 }}
        className="flex lg:flex flex-col w-80 bg-card/80 backdrop-blur-xl border-l border-border/50 shadow-2xl p-8 overflow-y-auto h-screen fixed right-0 top-0 z-40 lg:relative lg:z-auto"
      >
        {/* Logo */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/40">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-gold">IMPERIUM GATE</h1>
            <p className="text-muted-foreground text-sm">{locale === 'ar' ? 'قيصر الإمبراطورية' : 'Imperial Command'}</p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex gap-2 mb-12 p-2 bg-card/50 rounded-xl border border-border/30">
          <button
            onClick={() => {
              if (locale !== 'en') {
                router.push(pathname.replace(/^\/(ar|en)/, '/en'));
              }
              setSidebarOpen(false);
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              locale === 'en'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => {
              if (locale !== 'ar') {
                router.push(pathname.replace(/^\/(ar|en)/, '/ar'));
              }
              setSidebarOpen(false);
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              locale === 'ar'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AR
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 mb-12">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300
                  ${isActive(item.path)
                    ? "bg-primary/20 border border-primary/30 text-primary shadow-lg shadow-primary/20"
                    : "hover:bg-card/50 text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-medium">{t(item.labelKey)}</span>
                {isActive(item.path) && <Sparkles className="w-4 h-4 ml-auto text-primary" />}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <Button
            variant="outline"
            className="w-full glass"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 ml-3" />
            {t("logout")}
          </Button>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
