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
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No leads found
                                </TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id} className="hover:bg-muted/50/50 cursor-pointer" onClick={(e) => {
                                    // Prevent triggering check row click when clicking actions/checkbox
                                    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="checkbox"]')) return;
                                    onViewDetails(lead);
                                }}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedLeads.has(lead.id)}
                                            onCheckedChange={() => toggleSelect(lead.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{lead.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm">
                                            {lead.email && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">{lead.email}</span>
                                                </div>
                                            )}
                                            {lead.phone && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{lead.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" style={{ borderColor: (lead as any).stage?.color, color: (lead as any).stage?.color }}>
                                            {(lead as any).stage?.name || 'Unknown'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {lead.expectedValue ? `${lead.expectedValue} AED` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={priorityColor[lead.priority as keyof typeof priorityColor] || ''}>
                                            {lead.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{lead.source}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => onViewDetails(lead)}>
                                            <Edit className="w-4 h-4 text-muted-foreground" />
                                        </Button>
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
