"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "ok" | "error">("checking");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  useEffect(() => {
    // Check Supabase credentials
    const checkSupabase = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        
        // Try to get session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setSupabaseStatus("error");
          setError(`⚠️ Supabase Error: ${error.message}`);
        } else {
          setSupabaseStatus("ok");
          if (data?.session) {
            router.push(`/${locale}/dashboard`);
          }
        }
      } catch (err) {
        setSupabaseStatus("error");
        setError(err instanceof Error ? err.message : "Supabase initialization failed");
      }
    };

    checkSupabase();
  }, [locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (supabaseStatus === "error") {
        setError("❌ Supabase credentials are not configured. See SUPABASE_CREDENTIALS.txt");
        setIsLoading(false);
        return;
      }

      const { supabase } = await import("@/lib/supabase");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(`❌ Login failed: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        setSuccess(true);
        setIsLoading(false);
        setTimeout(() => {
          router.refresh();
          router.push(`/${locale}/dashboard`);
        }, 100);
      } else {
        setError("❌ No session returned. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      setError(error instanceof Error ? `❌ ${error.message}` : "❌ An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              IMPERIUM GATE
            </h1>
            <p className="text-sm text-muted-foreground">Internal Platform</p>
          </div>

          {/* Status */}
          <div className="mb-6">
            {supabaseStatus === "checking" && (
              <div className="bg-blue-500/10 border border-blue-500/50 text-blue-600 px-4 py-3 rounded text-sm">
                🔄 Checking Supabase connection...
              </div>
            )}
            {supabaseStatus === "error" && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 px-4 py-3 rounded text-sm">
                ❌ Supabase credentials missing or invalid
                <p className="text-xs mt-2">
                  See <code className="bg-red-500/20 px-2 py-1">SUPABASE_CREDENTIALS.txt</code> for setup
                </p>
              </div>
            )}
            {supabaseStatus === "ok" && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-600 px-4 py-3 rounded text-sm">
                ✅ Supabase connected
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-600 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-600 px-4 py-3 rounded mb-6 text-sm">
              ✅ Login successful! Redirecting...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
                disabled={isLoading || supabaseStatus === "error"}
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                  disabled={isLoading || supabaseStatus === "error"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || supabaseStatus === "error"}
              className="w-full mt-6"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Help Text */}
          {supabaseStatus === "error" && (
            <div className="mt-6 p-4 bg-muted/50 rounded text-xs text-muted-foreground space-y-2">
              <p className="font-semibold">🔧 Setup Required:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Create Supabase account at supabase.com</li>
                <li>Create a new project</li>
                <li>Get API credentials from Settings → API</li>
                <li>Update .env.local with real credentials</li>
                <li>Restart dev server: npm run dev</li>
              </ol>
              <p className="mt-3 italic">See SUPABASE_CREDENTIALS.txt for detailed instructions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}