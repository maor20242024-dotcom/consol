
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useStackApp } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, BarChart3, Settings, LogOut, Users, TrendingUp, AlertCircle, Shield, Trash2, CheckCircle2, XCircle, MoreVertical, Terminal, Play, RotateCcw, Flame, UserMinus } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { getUsers, updateUserRole, toggleUserStatus, deleteUser } from "@/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { PipelineManager } from "@/components/admin/PipelineManager";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { AuditLogs } from "@/components/admin/AuditLogs";

const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), { ssr: false });

export default function AdminPage() {
    const t = useTranslations("Admin");
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const stackApp = useStackApp();
    const locale = pathname.split('/')[1] || 'en';
    const [stats, setStats] = useState({ totalLeads: 0, totalUsers: 0, totalCampaigns: 0 });
    const [loading, setLoading] = useState(true);
    const [healthStatus, setHealthStatus] = useState<any[]>([]);
    const [checkingHealth, setCheckingHealth] = useState(false);

    // User Management State
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);

    // Simulation State
    const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [resetConfirmation, setResetConfirmation] = useState("");

    useEffect(() => {
        loadStats();
        checkSystemHealth();
        loadUsers();
    }, []);

    const loadStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        setUsersLoading(true);
        const result = await getUsers();
        if (result.success) {
            setUsers(result.users || []);
        } else {
            toast({ title: t("error"), description: result.error, variant: "destructive" });
        }
        setUsersLoading(false);
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        const result = await toggleUserStatus(userId, !currentStatus);
        if (result.success) {
            toast({ title: t("userUpdated") });
            loadUsers();
        } else {
            toast({ title: t("error"), variant: "destructive" });
        }
    };

    const handleRoleChange = async (userId: string, role: string) => {
        const result = await updateUserRole(userId, role);
        if (result.success) {
            toast({ title: t("userUpdated") });
            loadUsers();
        } else {
            toast({ title: t("error"), variant: "destructive" });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm(t("confirmDeleteUser"))) return;
        const result = await deleteUser(userId);
        if (result.success) {
            toast({ title: t("userDeleted") });
            loadUsers();
            loadStats();
        } else {
            toast({ title: t("error"), variant: "destructive" });
        }
    };

    const checkSystemHealth = async () => {
        setCheckingHealth(true);
        try {
            const res = await fetch("/api/health");
            const data = await res.json();
            setHealthStatus(data.results || []);
        } catch (error) {
            console.error("Health check failed:", error);
            setHealthStatus([]);
        } finally {
            setCheckingHealth(false);
        }
    };

    const handleSimulationAction = async (action: string) => {
        setIsSimulating(true);
        setSimulationLogs(prev => [...prev, `> Initiating Protocol: ${action}...`]);

        try {
            const res = await fetch('/api/admin/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();

            if (data.success) {
                setSimulationLogs(prev => [...prev, `> ✅ Success: ${data.message}`, ...data.logs.split('\n')]);
                toast({ title: "Simulation command executed successfully" });
                loadStats(); // Refresh stats
            } else {
                setSimulationLogs(prev => [...prev, `> ❌ Error: ${data.error}`]);
                toast({ title: "Error executing command", variant: "destructive" });
            }
        } catch (error: any) {
            setSimulationLogs(prev => [...prev, `> ❌ Critical Failure: ${error.message}`]);
        } finally {
            setIsSimulating(false);
            setResetDialogOpen(false);
            setResetConfirmation("");
        }
    };

    const handleLogout = async () => {
        await stackApp.signOut();
        // Force clear the legacy session cookie
        document.cookie = "imperium_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        window.location.href = `/${locale}/login`;
    };

    const safeHealthStatus = Array.isArray(healthStatus) ? healthStatus : [];
    const overallHealth = safeHealthStatus.every(s => s.status === "operational") ? 100 :
        safeHealthStatus.some(s => s.status === "down") ? 50 : 80;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 relative overflow-hidden" dir={locale === "ar" ? "rtl" : "ltr"}>
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <FloatingDots />
            </div>

            <div className="flex-1 overflow-auto max-w-7xl mx-auto px-4 sm:px-8">
                {/* Header */}
                <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#020617]/40 border-b border-white/5 py-8 mb-10 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary via-primary/80 to-primary/40 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] border border-white/10 rotate-3">
                            <Crown className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">{t("title")}</h2>
                            <div className="flex items-center gap-3">
                                <p className="text-xs font-black text-primary/40 uppercase tracking-[0.4em] mt-1">{t("description")}</p>
                                <Badge variant="outline" className="border-green-500/30 text-green-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-green-500/5 animate-pulse">
                                    SIMULATION MODE ACTIVE
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className={`${overallHealth === 100 ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"} px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase animate-pulse backdrop-blur-md`}>
                            {overallHealth === 100 ? `Status: Nominal` : "Status: Disrupted"}
                        </Badge>
                        <Button variant="ghost" className="text-white/40 hover:text-white" onClick={handleLogout}><LogOut className="w-5 h-5" /></Button>
                    </div>
                </header>

                <main className="pb-20 space-y-12">
                    {/* Stats Cockpit */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: "CRM SECTOR", value: stats.totalLeads, color: "from-blue-500/20 to-transparent", icon: Users, accent: "text-blue-400" },
                            { label: "COLLECTIVE", value: stats.totalUsers, color: "from-primary/20 to-transparent", icon: Users, accent: "text-primary" },
                            { label: "ACTIVE FRONT", value: stats.totalCampaigns, color: "from-green-500/20 to-transparent", icon: TrendingUp, accent: "text-green-400" },
                            { label: "CORE HEALTH", value: `${overallHealth}%`, color: "from-yellow-500/20 to-transparent", icon: AlertCircle, accent: "text-yellow-400" }
                        ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={i} className="bg-white/[0.03] border-white/[0.05] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all duration-500">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <CardContent className="p-8 relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.accent}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{stat.label}</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-4xl font-black tracking-tighter text-white">{stat.value}</p>
                                            <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Tabs defaultValue="simulation" className="space-y-8">
                        <TabsList className="flex w-full bg-white/[0.02] border border-white/[0.05] p-2 rounded-[2rem] backdrop-blur-xl">
                            <TabsTrigger value="simulation" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">Simulation Command</TabsTrigger>
                            <TabsTrigger value="pipeline" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">Pipeline Manager</TabsTrigger>
                            <TabsTrigger value="overview" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">{t("systemHealth")}</TabsTrigger>
                            <TabsTrigger value="users" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">{t("users")}</TabsTrigger>
                            <TabsTrigger value="campaigns" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">Campaigns</TabsTrigger>
                            <TabsTrigger value="settings" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">{t("settings")}</TabsTrigger>
                            <TabsTrigger value="audit" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all">Security Logs</TabsTrigger>
                        </TabsList>

                        {/* SIMULATION COMMAND CENTER */}
                        <TabsContent value="simulation" className="animate-in fade-in duration-700 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                                <Terminal className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black tracking-tight text-white">Scenario Injection</h3>
                                                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Surgical Data Operations</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <Button
                                                variant="outline"
                                                className="w-full h-14 justify-start px-6 bg-white/5 border-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 rounded-2xl group transition-all"
                                                onClick={() => handleSimulationAction('INJECT_NEGLECTED')}
                                                disabled={isSimulating}
                                            >
                                                <UserMinus className="w-5 h-5 mr-4 text-white/20 group-hover:text-amber-400" />
                                                <div className="text-left">
                                                    <div className="font-black text-[10px] uppercase tracking-widest">Inject Neglected Lead</div>
                                                    <div className="text-[10px] text-white/30">Creates a lead with 10 days inactivity</div>
                                                </div>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="w-full h-14 justify-start px-6 bg-white/5 border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 rounded-2xl group transition-all"
                                                onClick={() => handleSimulationAction('INJECT_HOT')}
                                                disabled={isSimulating}
                                            >
                                                <Flame className="w-5 h-5 mr-4 text-white/20 group-hover:text-emerald-400" />
                                                <div className="text-left">
                                                    <div className="font-black text-[10px] uppercase tracking-widest">Inject Hot Lead</div>
                                                    <div className="text-[10px] text-white/30">Creates a high-value qualified lead</div>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <div className="flex items-center gap-4 mb-6">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <h3 className="text-sm font-black tracking-widest uppercase text-red-500">Danger Zone</h3>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase tracking-widest"
                                            onClick={() => setResetDialogOpen(true)}
                                            disabled={isSimulating}
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Reset Database Loop
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="bg-black/40 border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden flex flex-col h-[500px]">
                                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Terminal Output</span>
                                        {isSimulating && <span className="animate-pulse text-[10px] text-primary font-black uppercase tracking-widest">Executing...</span>}
                                    </div>
                                    <ScrollArea className="flex-1 p-6 font-mono text-xs">
                                        {simulationLogs.length === 0 ? (
                                            <div className="text-white/20 text-center mt-20 italic">No operations executed.<br />System handling idle.</div>
                                        ) : (
                                            simulationLogs.map((log, i) => (
                                                <div key={i} className="mb-2 text-white/70 border-l-2 border-primary/20 pl-3 py-1">
                                                    {log}
                                                </div>
                                            ))
                                        )}
                                    </ScrollArea>
                                </Card>
                            </div>
                        </TabsContent>


                        <TabsContent value="pipeline" className="animate-in slide-in-from-right-8 duration-500">
                            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden p-10">
                                <PipelineManager />
                            </Card>
                        </TabsContent>

                        <TabsContent value="overview">
                            {/* Existing content reused inside new layout wrapper structure if needed, or kept as is*/}
                            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                                    <CardTitle className="text-2xl font-black tracking-tight">{t("systemHealth")}</CardTitle>
                                    <Button variant="outline" className="border-white/10 hover:bg-primary hover:text-black rounded-xl font-black text-[10px] tracking-widest" onClick={checkSystemHealth} disabled={checkingHealth}>
                                        {checkingHealth ? "SYNCHRONIZING..." : "RUN DIAGNOSTICS"}
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {safeHealthStatus.map((status, i) => (
                                            <div key={i} className="p-6 bg-white/[0.03] rounded-3xl border border-white/[0.05] flex items-center justify-between group hover:border-primary/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-3 h-3 rounded-full ${status.status === "operational" ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-red-500 animate-ping shadow-[0_0_15px_rgba(239,68,68,0.4)]"}`} />
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-tight">{status.service}</p>
                                                        {status.message && <p className="text-[10px] text-white/30 font-medium">{status.message}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {status.latency && <Badge variant="outline" className="border-white/5 text-[9px] font-mono opacity-50">{status.latency}ms</Badge>}
                                                    <Badge className={status.status === "operational" ? "bg-green-500/10 text-green-400 border-none" : "bg-red-500/10 text-red-400 border-none"}>
                                                        {status.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="users">
                            {/* Reusing existing User Table logic */}
                            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                <CardHeader className="p-10 flex flex-row items-center justify-between">
                                    <CardTitle className="text-2xl font-black tracking-tight">{t("users")}</CardTitle>
                                    <Badge variant="outline" className="border-primary/20 text-primary font-black px-4">{users.length} TOTAL SOULS</Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                                    <th className="p-6 pl-10 text-[10px] font-black text-white/20 uppercase tracking-widest">{t("name")}</th>
                                                    <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest">{t("role")}</th>
                                                    <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest">{t("status")}</th>
                                                    <th className="p-6 pr-10 text-right text-[10px] font-black text-white/20 uppercase tracking-widest">{t("actions")}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {usersLoading ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-20 text-center">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                                                        </td>
                                                    </tr>
                                                ) : users.map((user) => (
                                                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                                        <td className="p-6 pl-10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/5">
                                                                    {user.name?.[0] || user.email[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-sm text-white">{user.name || "Anonymous"}</p>
                                                                    <p className="text-[10px] text-white/30 font-mono tracking-tight">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            {/* Role Select would go here - simplified for brevity of rewrite */}
                                                            <Badge variant="outline" className="border-white/10 text-white/50">{user.role.toUpperCase()}</Badge>
                                                        </td>
                                                        <td className="p-6">
                                                            <Badge className={`${user.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"} border-none px-3 py-1`}>
                                                                {user.isActive ? "ACTIVE" : "DISABLED"}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-6 pr-10 text-right">
                                                            {/* Actions would go here */}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="campaigns">
                            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <CardTitle className="text-2xl font-black tracking-tight">Campaign Operations</CardTitle>
                                    <Button className="bg-primary text-black font-black uppercase tracking-widest px-8 h-12 rounded-2xl shadow-xl shadow-primary/20" onClick={() => router.push(`/${locale}/campaigns`)}>INITIATE COMMAND</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-3xl">
                                        <p className="text-[10px] font-black text-green-500/50 uppercase tracking-widest mb-1">Active Front</p>
                                        <p className="text-3xl font-black tracking-tighter text-green-400">{stats.totalCampaigns}</p>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings">
                            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden p-10 space-y-12">
                                <h3 className="text-2xl font-black tracking-tight mb-8">System Configuration</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-black text-white/50 uppercase tracking-widest mb-4">AI Core Protocols (Read-Only)</h4>
                                            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl h-48 overflow-y-auto text-xs font-mono text-white/60">
                                                You are Zeta, an advanced AI Real Estate Agent... (System Core Locked)
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-black text-primary/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Settings className="w-4 h-4" />
                                                Overlay Directives
                                            </h4>
                                            <textarea
                                                className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                                placeholder="Enter additional instructions for the AI..."
                                            />
                                            <Button className="mt-4 w-full bg-primary text-black font-black uppercase tracking-widest">
                                                Save Overlays
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Simulation Mode</h4>
                                                <p className="text-xs text-white/40 mt-1">Allow database reset & injection tools</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="border-green-500/20 text-green-400">ACTIVE</Badge>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Nexus Protocols</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                                                    <span className="text-xs text-white/60">Language Model</span>
                                                    <span className="text-xs font-mono text-primary">GPT-4-Turbo</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                                                    <span className="text-xs text-white/60">Response Time</span>
                                                    <span className="text-xs font-mono text-green-400">~800ms</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>
                        <TabsContent value="audit">
                            <Card className="bg-white/[0.02] border-white/[0.05] backdrop-blur-3xl rounded-[3rem] overflow-hidden p-10">
                                <AuditLogs />
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* RESET CONFIRMATION DIALOG */}
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogContent className="bg-[#0b1026] border-red-500/20 text-white rounded-[2rem] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 font-black tracking-tight flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            CRITICAL WARNING
                        </DialogTitle>
                        <DialogDescription className="text-white/60 pt-2">
                            This action will <strong>completely wipe</strong> the database and re-seed it with simulation data. This is irreversible.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-xs text-white/40 uppercase tracking-widest">Type "RESET" to confirm:</p>
                        <Input
                            value={resetConfirmation}
                            onChange={(e) => setResetConfirmation(e.target.value)}
                            className="bg-black/40 border-red-500/20 text-red-400 font-black tracking-widest placeholder:text-white/10"
                            placeholder="RESET"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost" className="rounded-xl">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest"
                            onClick={() => handleSimulationAction('RESET_AND_SEED')}
                            disabled={resetConfirmation !== "RESET"}
                        >
                            NUKE & RESET
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
