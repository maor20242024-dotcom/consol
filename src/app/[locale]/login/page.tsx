"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, User } from "lucide-react";

const FloatingDots = dynamic(
  () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
  { ssr: false }
);

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { locale } = useParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Successful login - The API will set a cookie in the future
        // For now we redirect, and we'll update the middleware to trust this
        router.push(`/${locale}/dashboard`);
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection to Command Center failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4 py-12 overflow-hidden font-sans">
      {/* Zeta Aesthetic Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-primary/5" />
        <FloatingDots />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-block p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-4 shadow-inner">
            <h1 className="text-3xl font-black tracking-tighter text-primary">
              IMPERIUM <span className="text-foreground">CONSOLE</span>
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            {t("welcomeBack")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("loginSubtitle")}
          </p>
        </div>

        <div className="glass p-8 rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10 transition-all duration-500 hover:border-primary/40">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email") || "Email"}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@imperiumgate.com"
                  className="pl-10 glass focus:border-primary transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password") || "Password"}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 glass focus:border-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "SIGN IN"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("restrictedAccess")}
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground/40 font-medium">
            &copy; {new Date().getFullYear()} Zeta Nexus • Alpha Command Security
          </p>
        </div>
      </div>

      <style jsx global>{`
        .glass {
          background: rgba(var(--background-rgb), 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}