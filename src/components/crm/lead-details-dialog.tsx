"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, DollarSign, User, Calendar, Activity as ActivityIcon } from "lucide-react";
import { Lead } from "@/types/crm";
import { getActivities } from "@/actions/activities";
import { ActivityTimeline } from "./activity-timeline";
import { AddActivityForm } from "./add-activity-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateLead, getEmployees } from "@/actions/crm";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, ExternalLink, MessageSquarePlus } from "lucide-react";

interface LeadDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: Lead | null;
}

export function LeadDetailsDialog({ open, onOpenChange, lead }: LeadDetailsDialogProps) {
    const t = useTranslations("CRM");
    const { toast } = useToast();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [initialActivityType, setInitialActivityType] = useState("NOTE");
    const [employees, setEmployees] = useState<any[]>([]);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Lead>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (lead && open) {
            loadActivities();
            loadEmployees();
            loadAuditLogs();
            setEditForm(lead);
            setIsEditing(false);
        }
    }, [lead, open]);

    const loadAuditLogs = async () => {
        if (!lead) return;
        setAuditLoading(true);
        try {
            const res = await fetch(`/api/admin/audit?entityId=${lead.id}&limit=20`);
            const data = await res.json();
            setAuditLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load audit logs", error);
        } finally {
            setAuditLoading(false);
        }
    };

    const loadEmployees = async () => {
        const result = await getEmployees();
        if (result.success) {
            setEmployees(result.employees || []);
        }
    }

    const loadActivities = async () => {
        if (!lead) return;
        setLoading(true);
        try {
            const data = await getActivities(lead.id);
            setActivities(data);
        } catch (error) {
            console.error("Failed to load activities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!lead || !editForm) return;
        setSaving(true);
        try {
            const result = await updateLead(lead.id, editForm as any);
            if (result.success) {
                toast({ title: "Lead updated successfully" });
                setIsEditing(false);
                window.location.reload();
            } else {
                toast({ title: "Failed to update lead", variant: "destructive" });
            }
        } catch (error) {
            console.error("Update error:", error);
        } finally {
            setSaving(false);
        }
    }

    const openWhatsApp = () => {
        if (!lead?.phone) return;
        const cleanPhone = lead.phone.replace(/\D/g, "");
        window.open(`https://wa.me/${cleanPhone}`, "_blank");
    }

    if (!lead) return null;

    // Helper for English Date Format DD/MM/YYYY
    const appDate = (date: Date | string) => {
        return new Date(date).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1100px] !w-[95vw] h-[90vh] bg-[#060b1d] border-blue-500/20 p-0 flex flex-col overflow-hidden rounded-[2.5rem] shadow-[0_0_100px_rgba(30,58,138,0.2)] lg:max-w-[1100px] sm:max-w-none">
                <div className="absolute inset-0 bg-blue-500/5 -z-10 pointer-events-none backdrop-blur-3xl" />

                {/* Sticky Header Section */}
                <div className="p-8 bg-blue-950/20 border-b border-blue-500/10 relative z-20 flex-none">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                            {isEditing ? (
                                <Input
                                    value={editForm.name || ""}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="text-2xl font-black tracking-tight h-12 bg-blue-950/40 border-blue-500/30 text-blue-50 rounded-xl"
                                />
                            ) : (
                                <DialogTitle className="text-4xl font-black tracking-tighter text-blue-50 drop-shadow-sm">
                                    {lead.name}
                                </DialogTitle>
                            )}
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-none px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                                    {lead.source}
                                </Badge>
                                <Badge variant="outline" className="border-blue-500/20 text-blue-400/60 font-mono text-[10px]">
                                    ID: {lead.id.slice(-6).toUpperCase()}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-200 h-11 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                onClick={() => {
                                    if (isEditing) handleSave();
                                    else setIsEditing(true);
                                }}
                                disabled={saving}
                            >
                                {isEditing ? (saving ? t("saving") : t("save")) : t("editProfile")}
                            </Button>
                            {isEditing && (
                                <Button variant="ghost" className="text-blue-400/60 hover:text-blue-300" onClick={() => setIsEditing(false)}>{t("cancel")}</Button>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Bar */}
                    <div className="mt-8 flex items-center gap-4">
                        <Button
                            className="bg-green-600 hover:bg-green-500 text-white font-black gap-2 h-12 px-8 rounded-2xl shadow-xl shadow-green-600/20 transition-all hover:scale-105 active:scale-95"
                            onClick={openWhatsApp}
                        >
                            <MessageCircle className="w-5 h-5" />
                            {t("whatsApp")}
                        </Button>
                        <Button
                            variant="secondary"
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-100 font-black gap-2 h-12 px-6 rounded-2xl border border-blue-500/20 shadow-xl transition-all"
                            onClick={() => {
                                setInitialActivityType("CALL");
                                setShowAddActivity(true);
                            }}
                        >
                            <MessageSquarePlus className="w-5 h-5 text-blue-400" />
                            {t("logCall")}
                        </Button>
                        <Button
                            variant="outline"
                            className="border-blue-500/20 bg-blue-900/10 hover:bg-blue-900/20 text-blue-300 font-black gap-2 h-12 px-6 rounded-2xl transition-all"
                            onClick={() => {
                                setInitialActivityType("MEETING");
                                setShowAddActivity(true);
                            }}
                        >
                            <Calendar className="w-5 h-5 text-blue-500/40" />
                            {t("schedule")}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    <div className="grid md:grid-cols-12 gap-8">
                        {/* Contact Information */}
                        <div className="md:col-span-8 space-y-6 bg-blue-950/20 p-8 rounded-[2rem] border border-blue-500/10 shadow-inner">
                            <h4 className="text-[11px] font-black text-blue-400/40 uppercase tracking-[0.3em] mb-4">{t("contactInformation")}</h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-blue-500/30 uppercase tracking-widest">{t("phone")}</label>
                                    <div className="flex items-center gap-3 font-bold group">
                                        <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                            <Phone className="w-4 h-4 text-blue-400" />
                                        </div>
                                        {isEditing ? (
                                            <Input className="bg-blue-950/40 border-blue-500/20 h-10" value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                        ) : (
                                            <span className="text-blue-50 text-base font-black">{lead.phone || "—"}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-blue-500/30 uppercase tracking-widest">{t("email")}</label>
                                    <div className="flex items-center gap-3 font-bold group">
                                        <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                            <Mail className="w-4 h-4 text-blue-400" />
                                        </div>
                                        {isEditing ? (
                                            <Input className="bg-blue-950/40 border-blue-500/20 h-10" value={editForm.email || ""} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                        ) : (
                                            <span className="text-blue-50 text-base font-black truncate max-w-full" title={lead.email || ""}>{lead.email || "—"}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2 pt-2 border-t border-white/[0.03]">
                                    <label className="text-[10px] font-black text-blue-500/30 uppercase tracking-widest">{t("investmentBudget")}</label>
                                    <div className="flex items-center gap-4 font-black group">
                                        <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                                            <DollarSign className="w-6 h-6 text-primary" />
                                        </div>
                                        {isEditing ? (
                                            <Input className="bg-blue-950/40 border-blue-500/20 h-12 text-xl font-black" value={editForm.budget || ""} onChange={e => setEditForm({ ...editForm, budget: e.target.value })} />
                                        ) : (
                                            <span className="text-3xl text-primary tracking-tighter drop-shadow-[0_0_15px_rgba(var(--primary),0.3)] font-mono">{lead.budget ? lead.budget : "0"}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ownership */}
                        <div className="md:col-span-4 space-y-6 bg-blue-900/10 p-8 rounded-[2rem] border border-blue-500/10 border-dashed">
                            <h4 className="text-[11px] font-black text-blue-400/40 uppercase tracking-[0.3em] mb-4">{t("ownership")}</h4>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-blue-500/30 uppercase tracking-widest">{t("assignOwner")}</label>
                                    <Select
                                        value={editForm.assignedTo || lead.assignedTo || ""}
                                        onValueChange={v => setEditForm({ ...editForm, assignedTo: v })}
                                        disabled={!isEditing && !saving}
                                    >
                                        <SelectTrigger className="w-full bg-blue-950/60 border-blue-500/20 h-12 rounded-xl text-blue-100 font-bold">
                                            <SelectValue placeholder="Select Personnel" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0a1129] border-blue-500/30 text-blue-100">
                                            {employees.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id} className="focus:bg-blue-500/20 font-bold">{emp.name || emp.email}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-blue-500/30 uppercase tracking-widest">{t("priority")}</label>
                                    <Select
                                        value={editForm.priority || lead.priority}
                                        onValueChange={v => setEditForm({ ...editForm, priority: v })}
                                        disabled={!isEditing}
                                    >
                                        <SelectTrigger className="w-full bg-blue-950/60 border-blue-500/20 h-12 rounded-xl text-blue-100 font-black uppercase tracking-tighter">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0a1129] border-blue-500/30 text-blue-100">
                                            <SelectItem value="LOW" className="text-blue-400 font-bold uppercase">LOW</SelectItem>
                                            <SelectItem value="MEDIUM" className="text-yellow-400 font-bold uppercase">MEDIUM</SelectItem>
                                            <SelectItem value="HIGH" className="text-red-400 font-bold uppercase">HIGH CRITICAL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-blue-500/10" />

                    {/* Timeline & Audit */}
                    <Tabs defaultValue="timeline" className="w-full">
                        <TabsList className="sticky top-0 z-10 flex w-full bg-[#060b1d]/80 backdrop-blur-md p-1.5 rounded-2xl mb-8 border border-blue-500/10 shadow-xl">
                            <TabsTrigger value="timeline" className="flex-1 rounded-xl h-11 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                <ActivityIcon className="w-4 h-4 mr-2 opacity-50" />
                                {t("interactionTimeline")}
                            </TabsTrigger>
                            <TabsTrigger value="details" className="flex-1 rounded-xl h-11 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                <User className="w-4 h-4 mr-2 opacity-50" />
                                {t("systemAudit")}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="space-y-8 animate-in fade-in duration-500">
                            {showAddActivity && (
                                <div className="animate-in slide-in-from-top-4 duration-500 bg-blue-950/20 p-8 rounded-[2rem] border border-blue-500/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4">
                                        <Button variant="ghost" size="sm" className="text-blue-400/40 hover:text-blue-300" onClick={() => setShowAddActivity(false)}>{t("cancel")}</Button>
                                    </div>
                                    <h3 className="text-xl font-black text-blue-50 uppercase tracking-tighter mb-8">{t("addActivity")}</h3>
                                    <AddActivityForm
                                        leadId={lead.id}
                                        initialType={initialActivityType}
                                        onSuccess={() => {
                                            setShowAddActivity(false);
                                            loadActivities();
                                        }}
                                    />
                                </div>
                            )}

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            ) : (
                                <ActivityTimeline activities={activities} />
                            )}
                        </TabsContent>

                        <TabsContent value="details" className="bg-blue-950/20 p-10 rounded-[2.5rem] border border-blue-500/10 animate-in fade-in duration-500 space-y-8">
                            <div className="grid grid-cols-2 gap-12 text-sm border-b border-blue-500/10 pb-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-blue-500/30 uppercase tracking-widest">Capture Timestamp</label>
                                    <p className="font-mono text-blue-100 text-base">{lead.createdAt ? appDate(lead.createdAt) : 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-blue-500/30 uppercase tracking-widest">Last Secure Sync</label>
                                    <p className="font-mono text-blue-100 text-base">{lead.updatedAt ? appDate(lead.updatedAt) : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-blue-400/40 uppercase tracking-[0.3em] mb-4">Change Log</h4>
                                {auditLoading ? (
                                    <div className="text-center py-4 text-blue-500/50">Loading audit trail...</div>
                                ) : auditLogs.length === 0 ? (
                                    <div className="text-center py-4 text-blue-500/30 italic">No audit records found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {auditLogs.map((log) => (
                                            <div key={log.id} className="flex flex-col gap-1 border-l-2 border-blue-500/20 pl-4 py-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] h-4 border-blue-500/30 text-blue-300/70 font-mono">
                                                        {log.action}
                                                    </Badge>
                                                    <span className="text-[10px] text-blue-500/40 font-mono">
                                                        {appDate(log.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-blue-100 font-medium">
                                                    {log.details}
                                                </p>
                                                <p className="text-[10px] text-blue-500/40 uppercase tracking-wider">
                                                    By {log.user}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
