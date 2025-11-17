"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";

import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";

import { Label } from "@/components/ui/label";

import {

  Crown, Bot, Globe, Phone, Shield, Rocket, Sparkles,

  DollarSign, Target, Users, ArrowUpRight, Activity,

  Star, Menu, X, Lock, Eye, ArrowRight

} from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const FloatingDots = dynamic(

  () => import("@/components/FloatingDots").then(m => m.FloatingDots),

  { ssr: false }

);

export default function HomePage() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const t = useTranslations("Dashboard");

  const stats = [

    { value: "8.75M", label: t("aedRevenue"), change: "+12.5%" },

    { value: "24", label: t("activeCampaigns"), change: "+3" },

    { value: "1,247", label: t("potentialClients"), change: "+187" },

    { value: "18.7%", label: t("conversionRate"), change: "+2.1%" },

  ];

  const features = [

    { icon: Bot, title: t("advancedAi"), desc: t("aiDesc") },

    { icon: Globe, title: t("multiChannel"), desc: t("multiDesc") },

    { icon: Phone, title: t("voiceCalls"), desc: t("voiceDesc") },

    { icon: Shield, title: t("security"), desc: t("securityDesc") },

  ];

  const testimonials = [

    { name: t("ahmedName"), text: t("ahmedTestimonial") },

    { name: t("fatimaName"), text: t("fatimaTestimonial") },

    { name: t("khalidName"), text: t("khalidTestimonial") },

  ];

  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);

    }, 6000);

    return () => clearInterval(interval);

  }, [testimonials.length]);

  return (

    <>

      {/* ==================== BACKGROUND MAGIC ==================== */}

      <div className="fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute inset-0 bg-background" />

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

        <FloatingDots />

      </div>

      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen">

        {/* ==================== NAVBAR ==================== */}

        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl">

          <div className="container mx-auto px-6 py-5 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/30">

                <Crown className="w-7 h-7 text-primary-foreground" />

              </div>

              <span className="text-2xl font-bold text-foreground">IMPERIUM GATE</span>

            </div>

            <nav className="hidden lg:flex items-center gap-8">

              <Button variant="ghost" size="sm">{t("features")}</Button>

              <Button variant="ghost" size="sm">Pricing</Button>

              <Button variant="ghost" size="sm">{t("contact")}</Button>

            </nav>

            <div className="flex items-center gap-4">

              <LanguageSwitcher />

              <Button onClick={() => setIsLoginModalOpen(true)} className="hidden sm:flex">

                {t("login")}

              </Button>

              <Button

                variant="ghost"

                size="icon"

                className="lg:hidden"

                onClick={() => setIsMenuOpen(!isMenuOpen)}

              >

                {isMenuOpen ? <X /> : <Menu />}

              </Button>

            </div>

          </div>

        </header>

        {/* ==================== HERO ==================== */}

        <section className="pt-32 pb-20 px-6">

          <div className="container mx-auto text-center">

            <div className="max-w-5xl mx-auto">

              <h1 className="text-6xl md:text-8xl font-bold mb-6">

                <span className="text-gradient-gold">{t("heroTitle")}</span>

              </h1>

              <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">

                {t("heroSubtitle")}

              </p>

              {/* Stats */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">

                {stats.map((s, i) => (

                  <Card key={i} className="glass card-hover">

                    <CardContent className="pt-6 text-center">

                      <div className="text-4xl font-bold text-foreground mb-2">{s.value}</div>

                      <p className="text-muted-foreground">{s.label}</p>

                      <p className="text-sm text-primary mt-2 flex items-center justify-center gap-1">

                        <ArrowUpRight className="w-4 h-4" /> {s.change}

                      </p>

                    </CardContent>

                  </Card>

                ))}

              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">

                <Button size="lg" className="text-lg px-12" onClick={() => setIsLoginModalOpen(true)}>

                  <Lock className="w-5 h-5 ml-3" />

                  {t("login")}

                </Button>

                <Button size="lg" variant="outline" className="text-lg px-12" onClick={() => setIsLoggedIn(true)}>

                  <Eye className="w-5 h-5 ml-3" />

                  {t("preview")}

                </Button>

              </div>

            </div>

          </div>

        </section>

        {/* ==================== FEATURES ==================== */}

        <section className="py-24 px-6 bg-muted/20">

          <div className="container mx-auto">

            <h2 className="text-5xl font-bold text-center mb-16 text-foreground">{t("featuresTitle")}</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

              {features.map((f, i) => (

                <Card key={i} className="glass card-hover h-full">

                  <CardHeader>

                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-6">

                      <f.icon className="w-10 h-10 text-primary-foreground" />

                    </div>

                    <CardTitle className="text-xl">{f.title}</CardTitle>

                  </CardHeader>

                  <CardContent>

                    <p className="text-muted-foreground">{f.desc}</p>

                  </CardContent>

                </Card>

              ))}

            </div>

          </div>

        </section>

        {/* ==================== TESTIMONIALS ==================== */}

        <section className="py-24 px-6">

          <div className="container mx-auto max-w-4xl">

            <Card className="glass">

              <CardContent className="pt-12 text-center">

                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-8 text-3xl font-bold text-primary-foreground">

                  {testimonials[currentTestimonial].name[0]}

                </div>

                <p className="text-2xl italic text-foreground mb-6">"{testimonials[currentTestimonial].text}"</p>

                <p className="text-muted-foreground text-lg">— {testimonials[currentTestimonial].name}</p>

                <div className="flex justify-center gap-2 mt-8">

                  {testimonials.map((_, i) => (

                    <button

                      key={i}

                      onClick={() => setCurrentTestimonial(i)}

                      className={`w-3 h-3 rounded-full transition-all ${i === currentTestimonial ? 'bg-primary w-8' : 'bg-muted-foreground/30'}`}

                    />

                  ))}

                </div>

              </CardContent>

            </Card>

          </div>

        </section>

        {/* ==================== FINAL CTA ==================== */}

        <section className="py-24 px-6">

          <div className="container mx-auto text-center">

            <Card className="glass max-w-4xl mx-auto p-16">

              <h2 className="text-5xl font-bold mb-6 text-foreground">{t("ctaTitle")}</h2>

              <p className="text-xl text-muted-foreground mb-12">{t("ctaSubtitle")}</p>

              <Button size="lg" className="text-xl px-16 py-8" onClick={() => setIsLoggedIn(true)}>

                <Sparkles className="w-6 h-6 ml-4" />

                {t("startFree")}

              </Button>

            </Card>

          </div>

        </section>

        {/* ==================== LOGIN MODAL ==================== */}

        {(isLoginModalOpen || isLoading) && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">

            <Card className="glass w-full max-w-md p-8">

              <div className="text-center mb-8">

                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-6">

                  <Crown className="w-12 h-12 text-primary-foreground" />

                </div>

                <h2 className="text-3xl font-bold">{t("welcomeBack")}</h2>

              </div>

              <form onSubmit={(e) => { e.preventDefault(); setIsLoading(true); setTimeout(() => { setIsLoggedIn(true); setIsLoading(false); }, 1500); }} className="space-y-6">

                <div>

                  <Label>{t("email")}</Label>

                  <Input type="email" placeholder="king@imperiumgate.com" className="mt-2" required />

                </div>

                <div>

                  <Label>{t("password")}</Label>

                  <Input type="password" placeholder="••••••" className="mt-2" required />

                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>

                  {isLoading ? t("loggingIn") : t("secureLogin")}

                </Button>

              </form>

              <div className="text-center mt-6">

                <Button variant="link" onClick={() => setIsLoggedIn(true)}>

                  {t("previewAsGuest")}

                </Button>

              </div>

            </Card>

          </div>

        )}

      </div>

    </>

  );

}