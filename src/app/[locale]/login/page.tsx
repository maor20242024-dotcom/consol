"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { useRouter, usePathname } from "next/navigation";

import dynamic from "next/dynamic";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Checkbox } from "@/components/ui/checkbox";

import { Label } from "@/components/ui/label";

import { ImperiumLogo } from "@/components/ImperiumLogo";

import { Eye, EyeOff, Shield, Crown, Sparkles } from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const FloatingDots = dynamic(

  () => import("@/components/FloatingDots").then((m) => m.FloatingDots),

  { ssr: false }

);

export default function LoginPage() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  const router = useRouter();

  const pathname = usePathname();

  const t = useTranslations("Dashboard");

  const locale = pathname.split('/')[1] || 'en';

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setIsLoading(true);

    setError("");

    try {
      console.log("🔐 Attempting login with:", { email });
      console.log("🔐 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("🔐 Anon Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      console.log("🔐 Anon Key length:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("🔐 Login response:", { data, error });

      if (error) {
        console.error("❌ Login error:", error);
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        console.log("✅ Login successful! Redirecting...");
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch (error) {
      console.error("❌ Unexpected login error:", error);
      setError("An unexpected error occurred during login");
      setIsLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-background relative overflow-hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>    {/* Animated Background */}

      <div className="fixed inset-0 -z-10">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

        <div className="absolute inset-0 opacity-5">

          <div

            className="absolute inset-0"

            style={{

              backgroundImage: `

                linear-gradient(90deg, rgb(var(--foreground)/0.03) 1px, transparent 1px),

                linear-gradient(rgb(var(--foreground)/0.03) 1px, transparent 1px)

              `,

              backgroundSize: "80px 80px",

            }}

          />

        </div>

        <FloatingDots />

      </div>

      {/* Main Content */}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Luxury Glass Card */}

          <div className="glass rounded-3xl shadow-2xl p-10 border border-border/50">

            {/* Logo */}

            <div className="flex justify-center mb-10">

              <div className="relative">

                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />

                <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40">

                  <Crown className="w-14 h-14 text-primary-foreground" />

                </div>

              </div>

            </div>

            {/* Title */}

            <div className="text-center mb-10">

              <h1 className="text-4xl font-bold text-foreground mb-3">

                {t("welcomeBack")}

              </h1>

              <p className="text-muted-foreground text-lg">

                {t("subtitle")}

              </p>

            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Form */}

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Email */}

              <div>

                <Label htmlFor="email" className="text-foreground/90">

                  {t("email")}

                </Label>

                <Input

                  id="email"

                  type="email"

                  placeholder={t("emailPlaceholder")}

                  value={email}

                  onChange={(e) => setEmail(e.target.value)}

                  className="mt-2 h-14 text-lg bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/30"

                  required

                />

              </div>

              {/* Password */}

              <div>

                <Label htmlFor="password" className="text-foreground/90">

                  {t("password")}

                </Label>

                <div className="relative mt-2">

                  <Input

                    id="password"

                    type={showPassword ? "text" : "password"}

                    placeholder={t("passwordPlaceholder")}

                    value={password}

                    onChange={(e) => setPassword(e.target.value)}

                    className="h-14 text-lg bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/30 pr-12"

                    required

                  />

                  <button

                    type="button"

                    onClick={() => setShowPassword(!showPassword)}

                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"

                  >

                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}

                  </button>

                </div>

              </div>

              {/* Remember Me */}

              <div className="flex items-center space-x-3 space-x-reverse">

                <Checkbox

                  id="remember"

                  checked={rememberMe}

                  onCheckedChange={(c) => setRememberMe(c as boolean)}

                />

                <Label htmlFor="remember" className="text-foreground/80 cursor-pointer">

                  <span className="flex items-center gap-2">

                    <Shield className="w-4 h-4 text-primary" />

                    {t("rememberMe")}

                  </span>

                </Label>

              </div>

              {/* Submit Button */}

              <Button

                type="submit"

                disabled={isLoading}

                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 disabled:opacity-70"

              >

                {isLoading ? (

                  <div className="flex items-center gap-3">

                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />

                    {t("loggingIn")}

                  </div>

                ) : (

                  <div className="flex items-center gap-3">

                    <Sparkles className="w-5 h-5" />

                    {t("loginNow")}

                  </div>

                )}

              </Button>

            </form>

            {/* Guest Preview */}

            <div className="mt-8 text-center">

              <p className="text-muted-foreground text-sm mb-4">

                {t("wantPreview")}

              </p>

              <Button variant="outline" className="glass card-hover">

                <Eye className="w-4 h-4 ml-2" />

                {t("previewAsGuest")}

              </Button>

            </div>

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="absolute bottom-6 left-0 right-0 text-center">

        <p className="text-muted-foreground/60 text-sm">

          © 2025 IMPERIUM GATE • {t("copyright")}

        </p>

      </div>

    </div>

  );

}