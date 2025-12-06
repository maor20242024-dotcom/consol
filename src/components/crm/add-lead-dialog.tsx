"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLead } from "@/actions/crm";
import { useToast } from "@/hooks/use-toast";
import { LEAD_SOURCES, getLeadSourceOptions, DEFAULT_LEAD_SOURCE } from "@/lib/lead-sources";

interface AddLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pipelineId: string;
    firstStageId: string;
    onLeadCreated?: () => void;
}

interface Campaign {
    id: string;
    name: string;
    status: string;
    platform: string;
}

export function AddLeadDialog({ open, onOpenChange, pipelineId, firstStageId, onLeadCreated }: AddLeadDialogProps) {
    const t = useTranslations("CRM");
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        budget: "",
        source: DEFAULT_LEAD_SOURCE,
        campaignId: "" as string | null,
    });

    // Fetch campaigns for the dropdown
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoadingCampaigns(true);
                const response = await fetch('/api/campaigns');
                const result = await response.json();
                
                if (result.success) {
                    setCampaigns(result.campaigns.filter((c: Campaign) => c.status === 'ACTIVE'));
                }
            } catch (error) {
                console.error('Failed to fetch campaigns:', error);
            } finally {
                setLoadingCampaigns(false);
            }
        };

        if (open) {
            fetchCampaigns();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            toast({
                title: t("toastError"),
                description: t("toastRequiredFields"),
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        const result = await createLead({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            budget: formData.budget,
            source: formData.source,
            campaignId: formData.campaignId,
            pipelineId,
            stageId: firstStageId,
        });

        setLoading(false);

        if (result.success) {
            toast({
                title: t("toastSuccess"),
                description: t("toastSuccessMsg"),
            });
            setFormData({ 
                name: "", 
                phone: "", 
                email: "", 
                budget: "", 
                source: DEFAULT_LEAD_SOURCE,
                campaignId: "" 
            });
            onOpenChange(false);
            onLeadCreated?.();
        } else {
            toast({
                title: t("toastError"),
                description: result.error || "Failed to create lead",
                variant: "destructive",
            });
        }
    };

    const sourceOptions = getLeadSourceOptions();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("addLead")}</DialogTitle>
                    <DialogDescription>
                        {t("description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t("name")} *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t("name")}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">{t("phone")} *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+971501234567"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t("email")}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="example@email.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="budget">{t("budget")}</Label>
                            <Input
                                id="budget"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                placeholder="500,000 AED"
                            />
                        </div>
                        
                        {/* 🎯 NEW: Source Selection */}
                        <div className="grid gap-2">
                            <Label htmlFor="source">{t("source")}</Label>
                            <Select
                                value={formData.source}
                                onValueChange={(value) => setFormData({ ...formData, source: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("selectSource")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sourceOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{ backgroundColor: option.color }}
                                                />
                                                <span>{option.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 🎯 NEW: Campaign Selection */}
                        <div className="grid gap-2">
                            <Label htmlFor="campaignId">{t("campaign")}</Label>
                            <Select
                                value={formData.campaignId || ""}
                                onValueChange={(value) => setFormData({ ...formData, campaignId: value || null })}
                                disabled={loadingCampaigns}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("selectCampaignOptional")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">{t("noCampaign")}</SelectItem>
                                    {campaigns.map((campaign) => (
                                        <SelectItem key={campaign.id} value={campaign.id}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">
                                                    {campaign.platform}
                                                </span>
                                                <span>{campaign.name}</span>
                                                <span className="text-xs text-gray-400">
                                                    ({campaign.status})
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {loadingCampaigns && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {t("loadingCampaigns")}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? t("saving") : t("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
