"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Bot, Target, Phone, Database,
  Globe, Sparkles, TrendingUp, Settings, LogOut, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { ImperiumLogo } from "@/components/ImperiumLogo";

export function AppSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const isRtl = locale === 'ar';

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
    { icon: Target, labelKey: "crm", path: 'crm' },
    { icon: Phone, labelKey: "calls", path: 'voice' },
    { icon: Database, labelKey: "admin", path: 'admin' },
    { icon: Globe, labelKey: "campaigns", path: 'campaigns-manager' },
    { icon: Sparkles, labelKey: "adCreator", path: 'ad-creator' },
    { icon: Bot, labelKey: "instagram", path: 'instagram/content-manager' }, // Reusing Bot icon for now or similar
    { icon: TrendingUp, labelKey: "analytics", path: 'analytics' },
    { icon: Settings, labelKey: "settings", path: 'settings' },
  ];

  const isActive = (path: string) => {
    if (path === 'dashboard') {
      return pathname === `/${locale}` || pathname === `/${locale}/dashboard`;
    }
    return pathname.includes(`/${locale}/${path}`);
  };

  // Animation variants based on direction
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: isRtl ? 320 : -320 },
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 ltr:left-4 rtl:right-4 z-50 lg:hidden"
      >
        {sidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={sidebarOpen ? "open" : "closed"}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col w-80 bg-card/80 backdrop-blur-xl border-e border-border/50 shadow-2xl p-6 overflow-y-auto h-screen fixed ltr:left-0 rtl:right-0 top-0 z-40 lg:relative lg:z-auto"
      >
        {/* Logo */}
        <div className="flex items-center gap-4 mb-8 px-2">
          <ImperiumLogo />
        </div>

        {/* Language Switcher */}
        <div className="flex gap-2 mb-8 p-1.5 bg-card/50 rounded-xl border border-border/30">
          <button
            onClick={() => {
              if (locale !== 'en') {
                const newPath = pathname.replace(/^\/[a-z]{2}/, '/en');
                router.push(newPath);
              }
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${locale === 'en'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            EN
          </button>
          <button
            onClick={() => {
              if (locale !== 'ar') {
                const newPath = pathname.replace(/^\/[a-z]{2}/, '/ar');
                router.push(newPath);
              }
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${locale === 'ar'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            AR
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 mb-12 flex-1">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={i}
                onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group
                  ${active
                    ? "bg-primary/15 border border-primary/20 text-primary shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    : "hover:bg-card/50 text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                <span className="font-medium">{t(item.labelKey)}</span>
                {active && <Sparkles className="w-4 h-4 ltr:ml-auto rtl:mr-auto text-primary animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto pt-6 border-t border-border/20">
          <Button
            variant="outline"
            className="w-full glass justify-start gap-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </Button>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
