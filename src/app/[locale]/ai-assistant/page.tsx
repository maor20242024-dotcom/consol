"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Loader2, BarChart3, TrendingUp, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { PageShell } from "@/components/page-shell";

const FloatingDots = dynamic(
    () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
    { ssr: false }
);

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function AIAssistantPage() {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en";

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: locale === "ar" 
                ? "مرحباً! أنا مساعد الإمبراطورية الذكي. يمكنني مساعدتك في تحليل السوق والحصول على نصائح استثمارية وتقييم العملاء. ماذا تود أن تعرف؟"
                : "Hello! I'm the IMPERIUM AI Assistant. I can help you with market analysis, investment advice, client evaluation, and more. What would you like to know?",
            timestamp: new Date(),
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                locale === "ar"
                    ? "بناءً على البيانات الحالية، أتوقع نمو السوق بنسبة 15% في الربع القادم."
                    : "Based on current data, I predict market growth of 15% in the next quarter.",
                locale === "ar"
                    ? "هذا العميل لديه احتمالية تحويل عالية. أوصيك بمتابعة فورية."
                    : "This client has high conversion potential. I recommend immediate follow-up.",
                locale === "ar"
                    ? "الاستثمار في العقارات الفاخرة في منطقة الخليج يقدم عائداً متوسطاً بنسبة 18%."
                    : "Investing in luxury properties in the Gulf region offers average returns of 18%.",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: randomResponse,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setLoading(false);
        }, 1500);
    };

    const quickActions = [
        {
            icon: BarChart3,
            label: locale === "ar" ? "تحليل السوق" : "Market Analysis",
            prompt: locale === "ar" ? "حلل سوق العقارات الحالي" : "Analyze the current real estate market",
        },
        {
            icon: TrendingUp,
            label: locale === "ar" ? "نصائح استثمارية" : "Investment Tips",
            prompt: locale === "ar" ? "أعطني نصائح استثمارية" : "Give me investment recommendations",
        },
        {
            icon: Users,
            label: locale === "ar" ? "تقييم العملاء" : "Client Scoring",
            prompt: locale === "ar" ? "كيف يمكن تقييم العملاء المحتملين" : "How to evaluate potential clients",
        },
        {
            icon: Sparkles,
            label: locale === "ar" ? "إنشاء تقرير" : "Generate Report",
            prompt: locale === "ar" ? "أنشئ تقرير شامل" : "Create a comprehensive report",
        },
    ];

    const handleQuickAction = (prompt: string) => {
        setInput(prompt);
    };

    return (
        <div className="min-h-screen bg-background p-6 relative overflow-hidden" dir={locale === "ar" ? "rtl" : "ltr"}>
            <FloatingDots />
            <div className="max-w-6xl mx-auto relative z-10">
                <PageShell
                    title={locale === "ar" ? "المساعد الذكي" : "AI Assistant"}
                    subtitle={locale === "ar" ? "مساعد متقدم مدعوم بالذكاء الاصطناعي" : "Advanced AI-powered assistant"}
                    showBackButton
                    variant="gradient"
                >
                    {/* Main Chat Area */}
                    <div className="grid lg:grid-cols-4 gap-6">
                    {/* Chat Window */}
                    <div className="lg:col-span-3">
                        <Card className="bg-slate-800/50 border-primary/20 backdrop-blur h-[600px] flex flex-col">
                            {/* Messages */}
                            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                                                message.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-br-none font-medium"
                                                    : "bg-slate-700/50 text-gray-200 rounded-bl-none border border-primary/20"
                                            }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <p className={`text-xs mt-1 ${message.role === "user" ? "text-primary/70" : "text-gray-400"}`}>
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-700/50 text-gray-200 rounded-lg rounded-bl-none border border-primary/20 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <p className="text-sm">{locale === "ar" ? "جاري التفكير..." : "Thinking..."}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </CardContent>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-6 border-t border-primary/20">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={locale === "ar" ? "اكتب رسالتك هنا..." : "Type your message..."}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={loading}
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 text-primary-foreground"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Quick Actions Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="bg-slate-800/50 border-primary/20 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-lg">{locale === "ar" ? "إجراءات سريعة" : "Quick Actions"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {quickActions.map((action, i) => {
                                    const Icon = action.icon;
                                    return (
                                        <Button
                                            key={i}
                                            onClick={() => handleQuickAction(action.prompt)}
                                            variant="outline"
                                            className="w-full justify-start border-primary/20 hover:bg-primary/10 text-left h-auto py-3"
                                        >
                                            <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span className="text-xs">{action.label}</span>
                                        </Button>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Status */}
                        <Card className="bg-slate-800/50 border-primary/20 backdrop-blur mt-4">
                            <CardContent className="p-6 text-center">
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-3">
                                    ● {locale === "ar" ? "متصل" : "Online"}
                                </Badge>
                                <p className="text-sm text-gray-400">
                                    {locale === "ar" ? "المساعد جاهز للمساعدة" : "Assistant is ready to help"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    </div>
                </PageShell>
            </div>
        </div>
    );
}
