"use client";

import { useState } from "react";
import { Lead } from "@/types/crm";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, User, Phone, Mail, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { deleteLeads } from "@/actions/crm";
import { useToast } from "@/hooks/use-toast";

interface LeadListViewProps {
    leads: Lead[];
    onViewDetails: (lead: Lead) => void;
    onRefresh?: () => void;
}

export function LeadListView({ leads, onViewDetails, onRefresh }: LeadListViewProps) {
    const t = useTranslations("CRM");
    const { toast } = useToast();
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);

    const toggleSelectAll = () => {
        if (selectedLeads.size === leads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(leads.map((l) => l.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedLeads(newSelected);
    };

    const handleDeleteSelected = async () => {
        if (selectedLeads.size === 0) return;

        if (!confirm(t("confirmDelete"))) return;

        setDeleting(true);
        try {
            const result = await deleteLeads(Array.from(selectedLeads));
            if (result.success) {
                toast({
                    title: "Deleted",
                    description: `Deleted ${selectedLeads.size} leads.`
                });
                setSelectedLeads(new Set());
                if (onRefresh) onRefresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete leads",
                variant: "destructive"
            });
        } finally {
            setDeleting(false);
        }
    };

    const priorityColor = {
        LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
        <div className="space-y-4">
            {selectedLeads.size > 0 && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">{selectedLeads.size} selected</span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelected}
                        disabled={deleting}
                        className="ml-auto flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        {deleting ? "Deleting..." : "Delete Selected"}
                    </Button>
                </div>
            )}

            <div className="border rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={leads.length > 0 && selectedLeads.size === leads.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Name</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Contact</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Stage</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Value</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Priority</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Owner</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Source</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <User className="w-12 h-12" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Leads Synchronized</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id} className="hover:bg-primary/5 transition-colors group cursor-pointer border-b border-white/[0.02]" onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="checkbox"]')) return;
                                    onViewDetails(lead);
                                }}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedLeads.has(lead.id)}
                                            onCheckedChange={() => toggleSelect(lead.id)}
                                            className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-black text-sm tracking-tight text-white group-hover:text-primary transition-colors">{lead.name}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter mt-0.5">{new Date(lead.createdAt).toLocaleDateString()}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            {lead.phone && (
                                                <div className="flex items-center gap-2 group/phone">
                                                    <div className="p-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary group-hover/phone:bg-primary group-hover/phone:text-black transition-all">
                                                        <Phone className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground">{lead.phone}</span>
                                                </div>
                                            )}
                                            {lead.email && (
                                                <div className="flex items-center gap-2 group/email">
                                                    <div className="p-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-400 group-hover/email:bg-blue-500 group-hover/email:text-white transition-all">
                                                        <Mail className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground truncate max-w-[120px]">{lead.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="rounded-xl border-primary/20 bg-primary/5 text-[10px] font-black px-3 py-1" style={{ borderColor: (lead as any).stage?.color, color: (lead as any).stage?.color }}>
                                            {(lead as any).stage?.name || 'NEW'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 font-black text-xs text-emerald-400">
                                            <span className="text-[10px] opacity-40 mr-1 italic">AED</span>
                                            {lead.expectedValue ? Number(lead.expectedValue).toLocaleString() : '0'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`rounded-xl text-[9px] font-black tracking-wider px-2 py-0.5 border-none shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] ${priorityColor[lead.priority as keyof typeof priorityColor] || ''}`}>
                                            {lead.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <User className="w-3 h-3 text-primary" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-tighter">
                                                {lead.assignedTo ? lead.assignedTo.split('-').pop() : 'Unassigned'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-[9px] font-black text-muted-foreground/60 rounded-lg px-2 py-0.5 uppercase tracking-tighter">
                                            {lead.source}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-all">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`https://wa.me/${lead.phone?.replace(/\D/g, '')}`, '_blank');
                                                }}
                                            >
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.633 1.433h.005c6.554 0 11.89-5.335 11.893-11.892a11.826 11.826 0 00-3.375-8.414" /></svg>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-primary/20 hover:text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `tel:${lead.phone}`;
                                                }}
                                            >
                                                <Phone className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-white/10 hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails(lead);
                                                }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
