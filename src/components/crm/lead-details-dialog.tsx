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
import { updateLead } from "@/actions/crm";
import { useToast } from "@/hooks/use-toast";
import { LEAD_SOURCES } from "@/lib/lead-sources";

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
    const [showAddActivity, setShowAddActivity] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Lead>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (lead && open) {
            loadActivities();
            setEditForm(lead);
            setIsEditing(false);
        }
    }, [lead, open]);

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
                // Optionally reload lead data? Page shell handles reload via router context usually or we need callback.
                // But dialog props 'lead' might need refresh? 
                // Currently dialog uses passed prop. We might need an onUpdate callback prop.
                // For now, assuming parent refreshes page data.
                window.location.reload(); // Simple refresh for now or rely on revalidatePath
            } else {
                toast({ title: "Failed to update lead", variant: "destructive" });
            }
        } catch (error) {
            console.error("Update error:", error);
        } finally {
            setSaving(false);
        }
    }

    if (!lead) return null;

    const priorityColor = {
        LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            {isEditing ? (
                                <Input
                                    value={editForm.name || ""}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="text-xl font-bold h-9"
                                />
                            ) : (
                                <DialogTitle className="text-2xl">{lead.name}</DialogTitle>
                            )}
                            <DialogDescription>
                                {t("description")}
                            </DialogDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                            if (isEditing) handleSave();
                            else setIsEditing(true);
                        }} disabled={saving}>
                            {isEditing ? (saving ? "Saving..." : "Save") : "Edit"}
                        </Button>
                        {isEditing && (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="ml-2">
                                Cancel
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Lead Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {isEditing ? (
                                <Input value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                            ) : (
                                <span>{lead.phone || "N/A"}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {isEditing ? (
                                <Input value={editForm.email || ""} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                            ) : (
                                <span className="truncate">{lead.email}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            {isEditing ? (
                                <Input value={editForm.budget || ""} onChange={e => setEditForm({ ...editForm, budget: e.target.value })} placeholder="Budget" />
                            ) : (
                                <span>{lead.budget}</span>
                            )}
                        </div>
                        {/* ... other fields ... */}
                    </div>

                    {/* Quick Edit Stats */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {isEditing ? (
                            <Select value={editForm.priority || "MEDIUM"} onValueChange={v => setEditForm({ ...editForm, priority: v })}>
                                <SelectTrigger className="w-[120px] h-8">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Badge className={priorityColor[lead.priority as keyof typeof priorityColor]}>
                                {lead.priority}
                            </Badge>
                        )}

                        <Badge variant="outline">Score: {lead.score}</Badge>
                        <Badge variant="outline">Source: {lead.source}</Badge>
                    </div>

                    <Separator />
                    {/* ... tabs ... */}

                    {/* Tabs */}
                    <Tabs defaultValue="timeline" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="timeline">
                                <ActivityIcon className="w-4 h-4 mr-2" />
                                Timeline
                            </TabsTrigger>
                            <TabsTrigger value="details">
                                <Calendar className="w-4 h-4 mr-2" />
                                Details
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Activity History</h3>
                                <Button onClick={() => setShowAddActivity(!showAddActivity)} size="sm">
                                    {showAddActivity ? "Cancel" : "Add Activity"}
                                </Button>
                            </div>

                            {showAddActivity && (
                                <AddActivityForm
                                    leadId={lead.id}
                                    onSuccess={() => {
                                        setShowAddActivity(false);
                                        loadActivities();
                                    }}
                                />
                            )}

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <ActivityTimeline activities={activities} />
                            )}
                        </TabsContent>

                        <TabsContent value="details" className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                                    <p className="text-sm">{new Date(lead.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                    <p className="text-sm">{new Date(lead.updatedAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Expected Value</label>
                                    <p className="text-sm">{lead.expectedValue ? `${lead.expectedValue} AED` : "Not set"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <p className="text-sm capitalize">{lead.status}</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
