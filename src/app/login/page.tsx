"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ImperiumLogo } from "@/components/ImperiumLogo";
import { Eye, EyeOff, Shield } from "lucide-react";

// Import FloatingDots dynamically with SSR disabled
const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), {
  ssr: false,
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      // Handle login logic here
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-950 relative overflow-hidden" dir="rtl">
      {/* Static background layer - no random values */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-slate-900/30 to-indigo-900/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Client-only floating dots */}
      <FloatingDots />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Glassmorphism card */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-black/50 p-8">
            {/* Logo at top of card */}
            <div className="flex justify-center mb-8">
              <ImperiumLogo />
            </div>

            {/* Welcome title and description */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-3">
                مرحباً بعودتك!
              </h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                إدارة عقارات فاخرة بالذكاء الاصطناعي وتسويق متعدد القنوات
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div>
                <label className="block text-white text-sm mb-2 font-medium">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300"
                  required
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-white text-sm mb-2 font-medium">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="•••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <label htmlFor="remember" className="text-gray-300 text-sm">
                  تسجيل الدخول الآمن
                </label>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  "تسجيل الدخول الآن"
                )}
              </Button>
            </form>

            {/* Sign up link */}
            <div className="text-center mt-6">
              <p className="text-gray-300 text-sm">
                ليس لديك حساب؟{" "}
                <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  سجل الآن
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-gray-400 text-sm">
          © Imperium Gate Real Estate · جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}