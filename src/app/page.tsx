'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2, TrendingUp, Users, Target, Bot, Phone, Globe, Zap, BarChart3, ArrowUpRight,
  Activity, DollarSign, Crown, Database, Mic, Network, Shield, Star, Rocket, CheckCircle, User, Lock, Mail, Eye, Sparkles, ArrowRight
} from 'lucide-react';

// Import FloatingDots dynamically with SSR disabled
const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), {
  ssr: false,
});

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locale, setLocale] = useState('ar');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1500);
  };

  const switchLanguage = (newLocale: string) => {
    setLocale(newLocale);
  };

  // Translation function
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        welcome_back: "Welcome back!",
        connected: "Connected",
        dashboard: "Dashboard",
        logout: "Logout",
        imperial_command_center: "Imperial Command Center",
        luxury_property_ai_marketing: "AI-powered luxury property management and multi-channel marketing",
        aed_revenue: "AED Revenue",
        active_campaign: "Active Campaign",
        potential_client: "Potential Client",
        conversion_rate: "Conversion Rate",
        interactions: "Interactions",
        login: "Login",
        system_preview: "System Preview",
        logging_in: "Logging in...",
        email: "Email",
        password: "Password",
        secure_login: "Secure Login",
        no_account: "Don't have an account?",
        preview_as_guest: "Preview as Guest",
        why_imperium_gate: "Why IMPERIUM GATE?",
        integrated_platform: "The integrated platform for AI-powered luxury property management",
        customer_testimonials: "Customer Testimonials",
        start_your_imperial_journey: "Start Your Imperial Journey",
        advanced_ai_assistant: "Advanced AI Assistant",
        uae_dialect_analysis: "Powered by UAE dialect, intelligent client analysis",
        multi_channel_marketing: "Multi-Channel Marketing",
        integrated_campaign_management: "Integrated campaign management across all platforms",
        advanced_voice_calls: "Advanced Voice Calls",
        smart_calling_sentiment_analysis: "Smart calling system with sentiment analysis",
        advanced_security: "Advanced Security",
        advanced_encryption_data_protection: "Advanced encryption and full data protection",
        imperium_gate_subtitle: "Imperial Command Center for Luxury Properties",
        aed: "AED",
        ongoing: "Ongoing",
        total: "Total",
        excellent: "Excellent",
        today: "Today",
        welcome_to: "Welcome to",
        ahmed_mohamed: "Ahmed Mohamed",
        real_estate_investor: "Real Estate Investor",
        fatima_khaldouri: "Fatima Khaldouri",
        real_estate_agent: "Real Estate Agent",
        khalid_saeed: "Khalid Saeed",
        real_estate_developer: "Real Estate Developer",
        testimonial_ahmed: "Imperium Gate platform helped me achieve my investment goals. The system is very professional.",
        testimonial_fatima: "The best platform for managing luxury properties. The advanced features made my work much easier.",
        testimonial_khalid: "The integration between AI and design is amazing. Highly recommend it.",
        active_campaigns: "Active Campaigns",
        potential_clients: "Potential Clients",
        conversion: "Conversion",
        start_free: "Start Free",
        features_title: "Powerful Features",
        features_subtitle: "Everything you need to manage luxury properties with AI",
        get_started: "Get Started",
        learn_more: "Learn More"
      },
      ar: {
        welcome_back: "مرحباً بعودتك!",
        connected: "متصل",
        dashboard: "لوحة التحكم",
        logout: "تسجيل الخروج",
        imperial_command_center: "مركز القيادة الإمبراطوري",
        luxury_property_ai_marketing: "إدارة عقارات فاخرة بالذكاء الاصطناعي وتسويق متعدد القنوات",
        aed_revenue: "درهم إيرادات",
        active_campaign: "حملة نشطة",
        potential_client: "عميل محتمل",
        conversion_rate: "معدل التحويل",
        interactions: "التفاعلات",
        login: "تسجيل الدخول",
        system_preview: "معاينة النظام",
        logging_in: "جاري تسجيل الدخول...",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        secure_login: "تسجيل الدخول الآمن",
        no_account: "ليس لديك حساب؟",
        preview_as_guest: "معاينة النظام كضيف",
        why_imperium_gate: "لماذا IMPERIUM GATE؟",
        integrated_platform: "المنصة المتكاملة لإدارة العقارات الفاخرة بالذكاء الاصطناعي",
        customer_testimonials: "آراء العملاء",
        start_your_imperial_journey: "ابدأ رحلتك الإمبراطورية",
        advanced_ai_assistant: "مساعد ذكي متقدم",
        uae_dialect_analysis: "مدعوم باللهجة الإماراتية، تحليل ذكي للعملاء",
        multi_channel_marketing: "تسويق متعدد القنوات",
        integrated_campaign_management: "إدارة حملات متكاملة على جميع المنصات",
        advanced_voice_calls: "اتصالات صوتية متقدمة",
        smart_calling_sentiment_analysis: "نظام مكالمات ذكي مع تحليل المشاعر",
        advanced_security: "أمان متطور",
        advanced_encryption_data_protection: "تشفير متقدم وحماية كاملة للبيانات",
        imperium_gate_subtitle: "مركز القيادة الإمبراطوري للعقارات الفاخرة",
        aed: "درهم إماراتي",
        ongoing: "مستمرة",
        total: "إجمالي",
        excellent: "ممتاز",
        today: "اليوم",
        welcome_to: "مرحباً في",
        ahmed_mohamed: "أحمد محمد",
        real_estate_investor: "مستثمر عقاري",
        fatima_khaldouri: "فاطمة خالدوري",
        real_estate_agent: "وكيل عقاري",
        khalid_saeed: "خالد سعيد",
        real_estate_developer: "مطور عقاري",
        testimonial_ahmed: "منصة الإمبراطورية ساعدتني على تحقيق أهدافي الاستثمارية. النظام احترافي جداً.",
        testimonial_fatima: "أفضل منصة لإدارة العقارات الفاخرة. المميزات المتقدمة سهلت عملي بشكل كبير.",
        testimonial_khalid: "التكامل بين الذكاء الاصطناعي والتصميم رائع. أوصي به بشدة.",
        active_campaigns: "الحملات النشطة",
        potential_clients: "العملاء المحتملين",
        conversion: "معدل التحويل",
        start_free: "ابدأ مجاناً",
        features_title: "مميزات قوية",
        features_subtitle: "كل ما تحتاجه لإدارة العقارات الفاخرة بالذكاء الاصطناعي",
        get_started: "ابدأ الآن",
        learn_more: "اعرف المزيد"
      }
    };
    return translations[locale][key] || key;
  };

  const stats = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: t("aed_revenue"),
      value: "8.75M",
      subtitle: t("aed"),
      change: "+12.5%",
      color: "text-primary-400"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: t("active_campaign"),
      value: "24",
      subtitle: t("ongoing"),
      change: "+3",
      color: "text-accent-400"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: t("potential_client"),
      value: "1,247",
      subtitle: t("total"),
      change: "+8.2%",
      color: "text-success-400"
    },
    {
      icon: <ArrowUpRight className="w-5 h-5" />,
      title: t("conversion_rate"),
      value: "18.7%",
      subtitle: t("excellent"),
      change: "+2.1%",
      color: "text-primary-300"
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: t("interactions"),
      value: "4,521",
      subtitle: t("today"),
      change: "+15.3%",
      color: "text-accent-300"
    }
  ];

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: t("advanced_ai_assistant"),
      description: t("uae_dialect_analysis"),
      gradient: "from-primary-600 to-primary-400"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t("multi_channel_marketing"),
      description: t("integrated_campaign_management"),
      gradient: "from-accent-600 to-accent-400"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: t("advanced_voice_calls"),
      description: t("smart_calling_sentiment_analysis"),
      gradient: "from-success-600 to-success-400"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t("advanced_security"),
      description: t("advanced_encryption_data_protection"),
      gradient: "from-primary-700 to-primary-500"
    }
  ];

  const testimonials = [
    {
      name: t("ahmed_mohamed"),
      role: t("real_estate_investor"),
      content: t("testimonial_ahmed"),
      rating: 5,
      avatar: locale === 'ar' ? "أ.م" : "AM"
    },
    {
      name: t("fatima_khaldouri"),
      role: t("real_estate_agent"),
      content: t("testimonial_fatima"),
      rating: 5,
      avatar: locale === 'ar' ? "ف.خ" : "FK"
    },
    {
      name: t("khalid_saeed"),
      role: t("real_estate_developer"),
      content: t("testimonial_khalid"),
      rating: 5,
      avatar: locale === 'ar' ? "خ.س" : "KS"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-background-dark relative overflow-hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background-dark via-primary-950 to-background-dark"></div>
          <div className="absolute inset-0">
            <FloatingDots />
          </div>
        </div>

        {/* Header */}
        <header className="relative z-40 border-b border-glass-border/20 backdrop-blur-md bg-glass-bg/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">IMPERIUM GATE</h1>
                  <p className="text-secondary-300 text-sm">{t("welcome_back")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={locale === 'en' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => switchLanguage('en')}
                    className={`rounded-full transition-all duration-300 ${
                      locale === 'en' 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                        : 'text-secondary-300 hover:text-white hover:bg-glass-bg'
                    }`}
                  >
                    EN
                  </Button>
                  <Button
                    variant={locale === 'ar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => switchLanguage('ar')}
                    className={`rounded-full transition-all duration-300 ${
                      locale === 'ar' 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                        : 'text-secondary-300 hover:text-white hover:bg-glass-bg'
                    }`}
                  >
                    AR
                  </Button>
                </div>
                <Badge className="border-glass-border bg-glass-bg/50 text-success-400 shadow-lg">
                  <Activity className="w-3 h-3 ml-1" />
                  {t("connected")}
                </Badge>
                <Link 
                  href="/dashboard"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 font-semibold"
                >
                  {t("dashboard")}
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsLoggedIn(false)}
                  className="text-error-400 hover:text-error-300 hover:bg-glass-bg rounded-2xl transition-all duration-300"
                >
                  {t("logout")}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-20 container mx-auto px-6 py-12">
          {/* Welcome Section */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              {t("welcome_to")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">{t("imperial_command_center")}</span>
            </h2>
            <p className="text-secondary-300 text-xl mb-8 max-w-3xl mx-auto">
              {t("luxury_property_ai_marketing")}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="backdrop-blur-md bg-glass-bg/50 border border-glass-border rounded-3xl hover:bg-glass-bg/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-white">
                      <div className={`p-2 rounded-xl ${stat.color} bg-glass-bg/50`}>
                        {stat.icon}
                      </div>
                      <span className="mr-3 text-lg">{stat.title}</span>
                    </CardTitle>
                    <div className="flex items-center text-success-400 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <p className="text-secondary-400 text-sm">{stat.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="backdrop-blur-md bg-glass-bg/30 border border-glass-border rounded-3xl p-8 hover:bg-glass-bg/50 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                <CardHeader className="text-center pb-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-white text-xl mb-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-300 text-center leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Link 
              href="/dashboard"
              className="group relative inline-flex items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white px-12 py-5 rounded-3xl text-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                <Rocket className="w-6 h-6 ml-3" />
                {t("start_your_imperial_journey")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-primary-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark relative overflow-hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Animated Background with Advanced Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background-dark via-primary-950 to-background-dark"></div>
        
        {/* Radial gradient orbs with enhanced effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-glow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl animate-glow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success-400/8 rounded-full blur-3xl animate-glow" style={{animationDelay: '4s'}}></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-accent-400/15 to-success-400/10 animate-pulse"></div>
        </div>
        
        {/* Floating particles with enhanced motion */}
        <FloatingDots />
        
        {/* Subtle animated grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'slide 20s linear infinite'
          }}></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-40 backdrop-blur-md bg-glass-bg/30 border-b border-glass-border/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">IMPERIUM</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-secondary-300 hover:text-white transition-colors duration-300">{t("features")}</a>
                <a href="#" className="text-secondary-300 hover:text-white transition-colors duration-300">{t("pricing")}</a>
                <a href="#" className="text-secondary-300 hover:text-white transition-colors duration-300">{t("about")}</a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant={locale === 'en' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => switchLanguage('en')}
                  className={`rounded-full transition-all duration-300 ${
                    locale === 'en' 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                      : 'text-secondary-300 hover:text-white hover:bg-glass-bg'
                  }`}
                >
                  EN
                </Button>
                <Button
                  variant={locale === 'ar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => switchLanguage('ar')}
                  className={`rounded-full transition-all duration-300 ${
                    locale === 'ar' 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                      : 'text-secondary-300 hover:text-white hover:bg-glass-bg'
                  }`}
                >
                  AR
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-secondary-300 hover:text-white"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <div className="w-6 h-0.5 bg-current"></div>
                  <div className="w-6 h-0.5 bg-current"></div>
                  <div className="w-6 h-0.5 bg-current"></div>
                </div>
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <div className={`md:hidden absolute top-full right-0 w-64 backdrop-blur-md bg-glass-bg/90 border border-glass-border rounded-2xl mt-2 transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <div className="p-4 space-y-3">
              <a href="#" className="block text-secondary-300 hover:text-white transition-colors duration-300 py-2">{t("features")}</a>
              <a href="#" className="block text-secondary-300 hover:text-white transition-colors duration-300 py-2">{t("pricing")}</a>
              <a href="#" className="block text-secondary-300 hover:text-white transition-colors duration-300 py-2">{t("about")}</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-6xl mx-auto">
          {/* Floating Logo */}
          <div className="mb-12 relative">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 rounded-3xl shadow-2xl shadow-white/20 backdrop-blur-md animate-glow">
                <div className="w-full h-full flex items-center justify-center">
                  <Crown className="w-16 h-16 text-primary-600" />
                </div>
              </div>
              {/* Enhanced glow effect */}
              <div className="absolute -inset-8 bg-gradient-to-r from-primary-400/30 via-white/20 to-primary-400/30 rounded-3xl blur-2xl animate-glow"></div>
              <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-lg animate-pulse"></div>
            </div>
          </div>

          {/* Main Title */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-primary-300">
                IMPERIUM
              </span>
              <br />
              <span className="text-secondary-300">GATE</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              {t("imperium_gate_subtitle")}
            </p>
          </div>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <div className="backdrop-blur-md bg-glass-bg/50 border border-glass-border rounded-full px-8 py-4 hover:bg-glass-bg/70 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-3xl font-bold text-white">8.75M</div>
                  <div className="text-secondary-300 text-sm">{t("aed_revenue")}</div>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-md bg-glass-bg/50 border border-glass-border rounded-full px-8 py-4 hover:bg-glass-bg/70 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-accent-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-3xl font-bold text-white">24</div>
                  <div className="text-secondary-300 text-sm">{t("active_campaigns")}</div>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-md bg-glass-bg/50 border border-glass-border rounded-full px-8 py-4 hover:bg-glass-bg/70 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-3xl font-bold text-white">1,247</div>
                  <div className="text-secondary-300 text-sm">{t("potential_clients")}</div>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-md bg-glass-bg/50 border border-glass-border rounded-full px-8 py-4 hover:bg-glass-bg/70 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-3xl font-bold text-white">18.7%</div>
                  <div className="text-secondary-300 text-sm">{t("conversion")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => setIsLoggedIn(true)}
              className="group relative bg-gradient-to-r from-primary-500 to-primary-600 text-white px-10 py-6 rounded-3xl text-lg font-bold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                <User className="w-5 h-5 mr-3" />
                {t("login")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-success-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              onClick={() => setIsLoggedIn(true)}
              className="group relative backdrop-blur-md bg-glass-bg/50 border-2 border-glass-border text-white px-10 py-6 rounded-3xl text-lg font-bold hover:bg-glass-bg/70 hover:border-white/30 hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center">
                <Eye className="w-5 h-5 mr-3" />
                {t("system_preview")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("features_title")}
            </h2>
            <p className="text-xl text-secondary-300 mb-12 max-w-4xl mx-auto">
              {t("features_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <Card className="backdrop-blur-md bg-glass-bg/30 border border-glass-border rounded-3xl p-8 hover:bg-glass-bg/50 transition-all duration-300 hover:scale-105 hover:shadow-xl h-full">
                  <CardHeader className="text-center pb-6">
                    <div className={`w-24 h-24 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-white text-xl mb-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-300 text-center leading-relaxed mb-6">{feature.description}</p>
                    <Button className="w-full backdrop-blur-sm bg-glass-bg/50 border border-glass-border text-white hover:bg-glass-bg/70 transition-all duration-300 group-hover:border-primary-500/50">
                      {t("learn_more")}
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("customer_testimonials")}
            </h2>
          </div>
          
          <div className="relative max-w-6xl mx-auto">
            <div className="backdrop-blur-md bg-glass-bg/30 border border-glass-border rounded-[28px] p-12">
              <div className="relative">
                {/* Navigation dots */}
                <div className="flex justify-center space-x-2 mb-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentTestimonial === index 
                          ? 'bg-primary-500 scale-125' 
                          : 'bg-glass-border/50 hover:bg-glass-border/80'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Testimonial content */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {testimonials[currentTestimonial].avatar}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {testimonials[currentTestimonial].name}
                  </h3>
                  <p className="text-secondary-300 text-sm mb-4">
                    {testimonials[currentTestimonial].role}
                  </p>
                  <p className="text-secondary-200 text-lg leading-relaxed mb-8 italic">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-primary-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto text-center">
          <div className="backdrop-blur-md bg-glass-bg/40 border border-glass-border rounded-3xl p-16 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("start_your_imperial_journey")}
            </h2>
            <p className="text-xl text-secondary-300 mb-12 max-w-2xl mx-auto">
              {t("features_subtitle")}
            </p>
            <Button 
              size="lg"
              onClick={() => setIsLoggedIn(true)}
              className="group relative bg-gradient-to-r from-primary-500 to-primary-600 text-white px-16 py-6 rounded-3xl text-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                <Sparkles className="w-6 h-6 mr-3" />
                {t("start_free")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-success-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <div className="relative z-50">
        <div className={`fixed inset-0 backdrop-blur-lg bg-black/50 flex items-center justify-center transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="backdrop-blur-md bg-glass-bg/80 border border-glass-border rounded-3xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t("logging_in")}</h2>
              <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>

        <div className={`fixed inset-0 backdrop-blur-lg bg-black/50 flex items-center justify-center transition-opacity duration-300 ${!isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="backdrop-blur-md bg-glass-bg/80 border border-glass-border rounded-3xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{t("welcome_back")}</h2>
              <p className="text-secondary-300 mb-8">
                {t("luxury_property_ai_marketing")}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-white text-sm mb-3 font-medium">{t("email")}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-6 py-4 bg-glass-bg/50 border border-glass-border rounded-2xl text-white placeholder-secondary-400 focus:border-primary-500/50 focus:bg-glass-bg/70 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm mb-3 font-medium">{t("password")}</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  className="w-full px-6 py-4 bg-glass-bg/50 border border-glass-border rounded-2xl text-white placeholder-secondary-400 focus:border-primary-500/50 focus:bg-glass-bg/70 transition-all duration-300"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl text-lg font-bold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    {t("logging_in")}
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-3" />
                    {t("secure_login")}
                  </>
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-secondary-400 text-sm">{t("no_account")}</p>
              <Button 
                variant="link"
                className="text-primary-400 hover:text-primary-300 font-medium"
                onClick={() => setIsLoggedIn(true)}
              >
                {t("preview_as_guest")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}