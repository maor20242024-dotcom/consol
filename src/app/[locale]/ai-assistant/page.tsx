"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Send,
    Sparkles,
    Loader2,
    BarChart3,
    TrendingUp,
    Users,
    MessageSquare,
    Zap,
    Repeat,
    Settings,
    Shield,
    Bot,
    Target,
    FileText,
    Table,
    Download,
    Globe
} from "lucide-react";
import dynamic from "next/dynamic";
import { PageShell } from "@/components/page-shell";
import ReactMarkdown from "react-markdown";
import * as XLSX from 'xlsx';

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

    const [aiMode, setAiMode] = useState<'general' | 'crm' | 'instagram'>('general');
    const [streaming, setStreaming] = useState(false);

    // PII Sanitization Helper
    const sanitizeContent = (text: string) => {
        return text
            .replace(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g, "[EMAIL REDACTED]")
            .replace(/\+?[\d\s-]{8,}/g, "[PHONE REDACTED]")
            // First Name enforcement (Simple logic: if it looks like a full name "Name Surname", keep Name)
            .replace(/Name:\s*([A-Za-z]+)\s+[A-Za-z]+/g, "Name: $1 [Surname Redacted]");
    };

    const exportToExcel = () => {
        const data = messages.map(m => ({
            Time: m.timestamp.toLocaleString(),
            Identity: m.role === 'user' ? 'Alpha Command' : 'Zeta Intelligence',
            Protocol: sanitizeContent(m.content)
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Zeta_Intelligence");
        XLSX.writeFile(workbook, `ZETA_INTEL_${Date.now()}.xlsx`);
    };

    const exportToPDF = () => {
        const printContent = messages.map(m =>
            `[${m.timestamp.toLocaleString()}] ${m.role.toUpperCase()}:\n${sanitizeContent(m.content)}\n\n`
        ).join('--- \n');

        const blob = new Blob([printContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ZETA_COMMAND_LOG_${Date.now()}.txt`;
        a.click();
    };

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
        setStreaming(true);

        try {
            const response = await fetch('/api/ai-assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    mode: aiMode,
                    leadId: undefined, // Assuming leadId is not yet defined or is optional
                    conversationHistory: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    locale: locale
                }),
            });

            if (!response.ok) throw new Error('Failed to get AI response');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';

            if (reader) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, assistantMessage]);

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.content) {
                                    assistantContent += parsed.content;
                                    setMessages((prev) =>
                                        prev.map(m =>
                                            m.id === assistantMessage.id
                                                ? { ...m, content: assistantContent }
                                                : m
                                        )
                                    );
                                }
                            } catch (e) { }
                        }
                    }
                }
            }

            await fetch('/api/ai-assistant/save-conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage, {
                        role: "assistant",
                        content: assistantContent,
                        timestamp: new Date()
                    }],
                    mode: aiMode
                }),
            });

        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: locale === "ar" ? "تعذر الاتصال بالمركز. يرجى إعادة المحاولة." : "Failed to connect to Command Center. Please Retry.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            setStreaming(false);
        }
    };

    const quickActions = [
        {
            icon: BarChart3,
            label: locale === "ar" ? "تحليل السوق" : "Market Analysis",
            prompt: locale === "ar" ? "اعطني تحليلاً لسوق دبي العقاري الحالي" : "Analyze current Dubai real estate market",
        },
        {
            icon: TrendingUp,
            label: locale === "ar" ? "استراتيجيات استثمارية" : "Investment Strategy",
            prompt: locale === "ar" ? "أفضل مناطق الاستثمار العقاري حالياً" : "Best property investment areas right now",
        },
        {
            icon: Users,
            label: locale === "ar" ? "تقييم العملاء" : "Lead Scoring",
            prompt: locale === "ar" ? "كيف أصنف العملاء حسب الجدية؟" : "How to score leads by intent?",
        },
        {
            icon: Sparkles,
            label: locale === "ar" ? "توليد محتوى" : "Content Generation",
            prompt: locale === "ar" ? "ساعدني في كتابة وصف لإعلان فيلا فاخرة" : "Help me write a luxury villa ad caption",
        },
    ];

    const handleQuickAction = (prompt: string, mode: 'general' | 'crm' | 'instagram' = 'general') => {
        setAiMode(mode);
        setInput(prompt);
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col" dir={locale === "ar" ? "rtl" : "ltr"}>
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.1),transparent_50%)]" />
            <FloatingDots />

            <PageShell
                title={locale === "ar" ? "المساعد الذكي" : "ZETA AI COMMAND"}
                subtitle={locale === "ar" ? "مركز الذكاء الاصطناعي لوحدة Alpha" : "Alpha Command Intelligence Unit"}
                variant="gradient"
                className="flex-1 flex flex-col h-full overflow-hidden"
            >
                <div className="grid lg:grid-cols-4 gap-8 flex-1 overflow-hidden h-[calc(100vh-220px)]">
                    {/* Chat Window */}
                    <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
                        <div className="glass rounded-[2.5rem] border border-blue-500/10 shadow-[0_0_100px_rgba(30,58,138,0.1)] flex flex-col flex-1 overflow-hidden relative">
                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} group animate-in fade-in slide-in-from-bottom-4 duration-500`}
                                    >
                                        <div className={`flex items-center gap-3 mb-2 opacity-0 group-hover:opacity-100 transition-opacity ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                                            <div className={`p-1.5 rounded-lg border ${message.role === 'user' ? 'bg-primary/20 border-primary/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                                                {message.role === 'user' ? <Users className="w-3 h-3 text-primary" /> : <Bot className="w-3 h-3 text-blue-400" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {message.role === 'user' ? 'Alpha Command' : 'Zeta Core'}
                                            </span>
                                        </div>

                                        <div
                                            className={`max-w-[85%] px-6 py-4 rounded-[1.5rem] text-sm leading-relaxed shadow-xl ${message.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none font-bold shadow-primary/20"
                                                : "bg-blue-950/20 text-blue-50 rounded-tl-none border border-blue-500/10 backdrop-blur-3xl shadow-blue-500/5 prose prose-invert prose-sm"
                                                }`}
                                        >
                                            {message.role === 'assistant' ? (
                                                <ReactMarkdown className="markdown-content">
                                                    {message.content}
                                                </ReactMarkdown>
                                            ) : (
                                                <p>{message.content}</p>
                                            )}
                                        </div>
                                        <p className="text-[9px] font-black tracking-widest text-muted-foreground/50 mt-2 uppercase px-2">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex flex-col items-start animate-pulse">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-1.5 rounded-lg border bg-blue-500/20 border-blue-500/30">
                                                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Processing Input...</span>
                                        </div>
                                        <div className="h-20 w-64 bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] rounded-tl-none" />
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Status Bar */}
                            <div className="px-8 py-3 bg-blue-500/5 border-y border-blue-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Quantum Link: Stable</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-3 h-3 text-blue-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Encryption: Level 12</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Repeat className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Mode: {aiMode.toUpperCase()}</span>
                                </div>
                            </div>

                            {/* Input Form */}
                            <form onSubmit={handleSendMessage} className="p-8 bg-black/20 backdrop-blur-xl">
                                <div className="flex gap-4 items-center bg-white/5 p-2 rounded-[2rem] border border-white/10 focus-within:border-primary/50 transition-all shadow-inner">
                                    <div className="flex gap-1 ltr:ml-2 rtl:mr-2">
                                        <Button
                                            type="button"
                                            onClick={() => setAiMode('general')}
                                            variant="ghost"
                                            size="icon"
                                            className={`h-10 w-10 rounded-full transition-all ${aiMode === 'general' ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10'}`}
                                        >
                                            <Zap className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setAiMode('crm')}
                                            variant="ghost"
                                            size="icon"
                                            className={`h-10 w-10 rounded-full transition-all ${aiMode === 'crm' ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10'}`}
                                        >
                                            <Target className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder={locale === "ar" ? "أدخل أوامر Alpha هنا..." : "Enter Alpha Commands..."}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={loading}
                                        className="border-none bg-transparent focus-visible:ring-0 text-white placeholder-muted-foreground/50 h-10 font-medium"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="h-10 w-10 rounded-full bg-primary hover:bg-primary/80 text-primary-foreground p-0 ltr:mr-1 rtl:ml-1 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Desktop Sidebar Controls */}
                    <div className="hidden lg:flex flex-col gap-6">
                        <Card className="glass rounded-[2rem] border border-white/10 bg-white/5 overflow-hidden">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Tactical Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {quickActions.map((action, i) => {
                                    const Icon = action.icon;
                                    return (
                                        <Button
                                            key={i}
                                            onClick={() => handleQuickAction(action.prompt, i === 2 ? 'crm' : 'general')} // Lead Scoring index 2 -> CRM
                                            variant="outline"
                                            className="w-full justify-start rounded-[1.25rem] border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/30 text-white/80 hover:text-primary h-auto py-5 transition-all group"
                                        >
                                            <Icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                            <span className="text-[11px] font-black uppercase tracking-wider">{action.label}</span>
                                        </Button>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card className="glass rounded-[2rem] border border-blue-500/10 bg-blue-500/5 p-6 flex flex-col items-center text-center">
                            <div className="p-4 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
                                <Shield className="w-8 h-8 text-blue-400" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">Zeta Shield Active</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                All communications are proxied via Zeta Node Cluster 04. No trace of origin detectable.
                            </p>
                        </Card>

                        <div className="mt-auto">
                            <Button variant="ghost" className="w-full justify-start gap-3 rounded-2xl text-muted-foreground hover:text-white group">
                                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">System Params</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </PageShell>

            <style jsx global>{`
                .markdown-content p { @apply mb-4 last:mb-0; }
                .markdown-content ul { @apply list-disc list-inside mb-4; }
                .markdown-content ol { @apply list-decimal list-inside mb-4; }
                .markdown-content h1, .markdown-content h2, .markdown-content h3 { @apply font-black tracking-tighter text-blue-400 mb-2; }
                .markdown-content code { @apply bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs; }
                .scrollbar-none::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
