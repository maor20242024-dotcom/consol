"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createActivity } from "@/actions/activities";
import { generateSummary } from "@/actions/ai";
import { getEmployees } from "@/actions/crm";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect } from "react";

interface AddActivityFormProps {
    leadId: string;
    onSuccess?: () => void;
    initialType?: string;
}

export function AddActivityForm({ leadId, onSuccess, initialType = "NOTE" }: AddActivityFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        type: initialType,
        content: "",
        performedBy: "",
        scheduledFor: "",
        duration: "",
        aiSummary: "",
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        const result = await getEmployees();
        if (result.success) {
            setEmployees(result.employees || []);
        }
    }

    const handleGenerateSummary = async () => {
        if (!formData.content || formData.content.length < 10) {
            toast({
                title: "Content too short",
                description: "Please enter more content to generate a summary.",
                variant: "destructive",
            });
            return;
        }

        setAiLoading(true);
        const result = await generateSummary(formData.content);
        setAiLoading(false);

        if (result.success && result.summary) {
            setFormData(prev => ({ ...prev, aiSummary: result.summary }));
            toast({
                title: "AI Summary Generated",
                description: "Summary has been added to the activity.",
            });
        } else {
            toast({
                title: "Error",
                description: "Failed to generate summary.",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.content) {
            toast({
                title: "Error",
                description: "Content is required",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        const result = await createActivity({
            leadId,
            type: formData.type,
            content: formData.content,
            performedBy: formData.performedBy || undefined,
            scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined,
            duration: formData.duration ? parseInt(formData.duration) : undefined,
            isCompleted: formData.type !== "REMINDER",
            aiSummary: formData.aiSummary || undefined,
        });

        // If we have an AI summary, update it separately if createActivity doesn't support it yet
        // Or better, update createActivity signature. For now, let's assume we might need a separate call or update.
        // Checking createActivity signature... it doesn't take aiSummary in the previous step.
        // I will update createActivity signature in the next step.

        setLoading(false);

        if (result.success) {
            toast({
                title: "Success",
                description: "Activity added successfully",
            });
            setFormData({
                type: "NOTE",
                content: "",
                performedBy: "",
                scheduledFor: "",
                duration: "",
                aiSummary: "",
            });
            onSuccess?.();
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to add activity",
                variant: "destructive",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-muted/30 p-4 rounded-lg border">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Activity Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CALL">Phone Call</SelectItem>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                            <SelectItem value="INSTAGRAM">Instagram DM</SelectItem>
                            <SelectItem value="MEETING">Meeting</SelectItem>
                            <SelectItem value="NOTE">Note</SelectItem>
                            <SelectItem value="REMINDER">Reminder</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="performedBy">Performed By</Label>
                    <Select value={formData.performedBy} onValueChange={(value) => setFormData({ ...formData, performedBy: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>{emp.name || emp.email}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="content">Content *</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-primary gap-1"
                        onClick={handleGenerateSummary}
                        disabled={aiLoading || !formData.content}
                    >
                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        AI Summarize
                    </Button>
                </div>
                <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Describe the interaction or add notes..."
                    rows={4}
                    required
                />
            </div>

            {formData.aiSummary && (
                <div className="space-y-2 bg-primary/5 p-3 rounded border border-primary/10">
                    <Label className="text-xs text-primary font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Summary
                    </Label>
                    <p className="text-sm text-muted-foreground">{formData.aiSummary}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {(formData.type === "CALL" || formData.type === "MEETING") && (
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            placeholder="15"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="scheduledFor">Follow-up Date</Label>
                    <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={formData.scheduledFor}
                        onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Activity
                </Button>
            </div>
        </form>
    );
}
