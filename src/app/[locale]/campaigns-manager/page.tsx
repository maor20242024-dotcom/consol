"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageShell } from "@/components/page-shell";
import { Plus, Trash2, BarChart3, DollarSign, Target, Users, Calendar, TrendingUp, Zap, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { syncCampaigns } from "@/actions/campaigns";
import { useToast } from "@/hooks/use-toast";

const FloatingDots = dynamic(
    () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
    { ssr: false }
);

export default function CampaignsManagerPage() {
    const t = useTranslations("Campaigns");
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en";
    const { toast } = useToast();

    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        objective: "awareness",
        audience: "all",
        budget: "",
        startDate: "",
        endDate: "",
        placements: ["facebook", "instagram"],
        creative: {
            title: "",
            description: "",
            imageUrl: "",
            callToAction: "learn_more"
        }
    });
    const [aiSuggestions, setAiSuggestions] = useState({
        audience: "",
        budget: "",
        schedule: "",
        hashtags: "",
        adCopy: ""
    });
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch("/api/campaigns-manager");
            const data = await response.json();
            setCampaigns(data.campaigns || []);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await syncCampaigns();
            if (result.success) {
                toast({
                    title: "Synced Successfully",
                    description: "Campaigns updated from Facebook.",
                });
                fetchCampaigns();
            } else {
                toast({
                    title: "Sync Failed",
                    description: "Could not fetch data from Facebook.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Sync error", error);
        } finally {
            setSyncing(false);
        }
    };

    const generateAISuggestions = async () => {
        setIsGeneratingSuggestions(true);
        try {
            const response = await fetch("/api/campaigns-manager/ai-suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignName: formData.name,
                    description: formData.description,
                    objective: formData.objective
                })
            });

            const data = await response.json();
            if (data.success) {
                setAiSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error("Error generating AI suggestions:", error);
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    const createCampaign = async () => {
        if (!formData.name) return;

        try {
            const response = await fetch("/api/campaigns-manager", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    budget: parseFloat(formData.budget) || 0,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setCampaigns([data.campaign, ...campaigns]);
                setFormData({
                    name: "",
                    description: "",
                    objective: "awareness",
                    audience: "all",
                    budget: "",
                    startDate: "",
                    endDate: "",
                    placements: ["facebook", "instagram"],
                    creative: {
                        title: "",
                        description: "",
                        imageUrl: "",
                        callToAction: "learn_more"
                    }
                });
                setAiSuggestions({
                    audience: "",
                    budget: "",
                    schedule: "",
                    hashtags: "",
                    adCopy: ""
                });
                setShowForm(false);
            }
        } catch (error) {
            console.error("Error creating campaign:", error);
        }
    };

    const deleteCampaign = async (id: string) => {
        if (!confirm(t("deleteConfirm"))) return;

        try {
            const response = await fetch(`/api/instagram/campaigns/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
                setCampaigns(campaigns.filter((c) => c.id !== id));
            }
        } catch (error) {
            console.error("Error deleting campaign:", error);
        }
    };

    const statusStyles: Record<string, string> = {
        draft: "bg-slate-200 text-slate-600",
        scheduled: "bg-sky-200 text-sky-600",
        active: "bg-emerald-200 text-emerald-600",
        paused: "bg-amber-200 text-amber-600",
        completed: "bg-slate-500/20 text-slate-500",
    };

    const getStatusLabel = (status: string) => {
        const translation = t(`statuses.${status}` as const);
        return translation || status;
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/10" />
                <FloatingDots />
            </div>

            <div className="relative">
                <PageShell
                    title={t("title")}
                    description={t("description")}
                    variant="gradient"
                    actions={
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSync}
                                disabled={syncing}
                                className="h-12 px-4 border-primary/20 hover:bg-primary/5"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                                Sync
                            </Button>
                            <Button
                                onClick={() => setShowForm((prev) => !prev)}
                                className="flex items-center gap-2 h-12 px-6 text-lg"
                            >
                                <Plus className="w-5 h-5" />
                                {t("newCampaign")}
                            </Button>
                        </div>
                    }
                >
                    {showForm && (
                        <Card className="glass mb-8 border-primary/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {t("newCampaign")}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={generateAISuggestions}
                                        disabled={isGeneratingSuggestions || !formData.name}
                                        className="flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        {isGeneratingSuggestions ? "Generating..." : "AI Suggestions"}
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                        <TabsTrigger value="targeting">Targeting</TabsTrigger>
                                        <TabsTrigger value="creative">Creative</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">Campaign Name</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, name: e.target.value })
                                                    }
                                                    placeholder="e.g., Luxury Properties Dubai"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="objective">Objective</Label>
                                                <Select
                                                    value={formData.objective}
                                                    onValueChange={(value) => setFormData({ ...formData, objective: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="awareness">Brand Awareness</SelectItem>
                                                        <SelectItem value="traffic">Website Traffic</SelectItem>
                                                        <SelectItem value="engagement">Engagement</SelectItem>
                                                        <SelectItem value="leads">Lead Generation</SelectItem>
                                                        <SelectItem value="conversions">Conversions</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, description: e.target.value })
                                                }
                                                placeholder="Describe your campaign objectives..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="budget">Budget ($)</Label>
                                                <Input
                                                    id="budget"
                                                    type="number"
                                                    value={formData.budget}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, budget: e.target.value })
                                                    }
                                                    placeholder="1000"
                                                />
                                                {aiSuggestions.budget && (
                                                    <p className="text-sm text-blue-600 mt-1">
                                                        💡 AI Suggestion: {aiSuggestions.budget}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="audience">Audience</Label>
                                                <Select
                                                    value={formData.audience}
                                                    onValueChange={(value) => setFormData({ ...formData, audience: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Audiences</SelectItem>
                                                        <SelectItem value="custom">Custom Audience</SelectItem>
                                                        <SelectItem value="lookalike">Lookalike Audience</SelectItem>
                                                        <SelectItem value="retargeting">Retargeting</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {aiSuggestions.audience && (
                                                    <p className="text-sm text-blue-600 mt-1">
                                                        💡 AI Suggestion: {aiSuggestions.audience}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="startDate">Start Date</Label>
                                                <Input
                                                    id="startDate"
                                                    type="date"
                                                    value={formData.startDate}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, startDate: e.target.value })
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="endDate">End Date</Label>
                                                <Input
                                                    id="endDate"
                                                    type="date"
                                                    value={formData.endDate}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, endDate: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="targeting" className="space-y-4">
                                        <div>
                                            <Label>Placements</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {['facebook', 'instagram', 'messenger', 'audience_network'].map((placement) => (
                                                    <div key={placement} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={placement}
                                                            checked={formData.placements.includes(placement)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormData({ ...formData, placements: [...formData.placements, placement] });
                                                                } else {
                                                                    setFormData({ ...formData, placements: formData.placements.filter(p => p !== placement) });
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={placement} className="text-sm capitalize">
                                                            {placement.replace('_', ' ')}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {aiSuggestions.schedule && (
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <strong>💡 AI Schedule Suggestion:</strong> {aiSuggestions.schedule}
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="creative" className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Ad Title</Label>
                                            <Input
                                                id="title"
                                                value={formData.creative.title}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, creative: { ...formData.creative, title: e.target.value } })
                                                }
                                                placeholder="Enter your ad title..."
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="creativeDescription">Ad Description</Label>
                                            <Textarea
                                                id="creativeDescription"
                                                value={formData.creative.description}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, creative: { ...formData.creative, description: e.target.value } })
                                                }
                                                placeholder="Describe your property or offer..."
                                                rows={4}
                                            />
                                            {aiSuggestions.adCopy && (
                                                <p className="text-sm text-blue-600 mt-1">
                                                    💡 AI Ad Copy: {aiSuggestions.adCopy}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="imageUrl">Image URL</Label>
                                            <Input
                                                id="imageUrl"
                                                value={formData.creative.imageUrl}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, creative: { ...formData.creative, imageUrl: e.target.value } })
                                                }
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="callToAction">Call to Action</Label>
                                            <Select
                                                value={formData.creative.callToAction}
                                                onValueChange={(value) => setFormData({ ...formData, creative: { ...formData.creative, callToAction: value } })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="learn_more">Learn More</SelectItem>
                                                    <SelectItem value="shop_now">Shop Now</SelectItem>
                                                    <SelectItem value="book_now">Book Now</SelectItem>
                                                    <SelectItem value="sign_up">Sign Up</SelectItem>
                                                    <SelectItem value="contact_us">Contact Us</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {aiSuggestions.hashtags && (
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <strong>💡 AI Hashtags:</strong> {aiSuggestions.hashtags}
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>

                                <div className="flex gap-4 mt-6">
                                    <Button onClick={createCampaign} className="flex-1">
                                        <Target className="w-4 h-4 mr-2" />
                                        Create Campaign
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">{t("loading")}</p>
                        </div>
                    ) : campaigns.length === 0 ? (
                        <Card className="glass p-12 text-center border-primary/30">
                            <p className="text-muted-foreground text-lg mb-6">
                                {t("emptyState")}
                            </p>
                            <Button onClick={() => setShowForm(true)}>
                                {t("create")}
                            </Button>
                        </Card>
                    ) : (
                        <Card className="glass border-primary/30 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("name")}</TableHead>
                                        <TableHead>{t("status")}</TableHead>
                                        <TableHead>{t("budget")}</TableHead>
                                        <TableHead>{t("ads")}</TableHead>
                                        <TableHead>{t("actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaigns.map((campaign) => (
                                        <TableRow key={campaign.id} className="hover:bg-card/50">
                                            <TableCell className="font-medium">
                                                {campaign.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`px-2 py-1 rounded-full text-sm ${statusStyles[campaign.status] ||
                                                        "bg-muted/20 text-muted-foreground"
                                                        }`}
                                                >
                                                    {getStatusLabel(campaign.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4" />
                                                    {campaign.budget || "0"}
                                                </div>
                                            </TableCell>
                                            <TableCell>{campaign.ads || 0}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.push(
                                                                `/${locale}/ad-creator?campaignId=${campaign.id}`
                                                            )
                                                        }
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.push(
                                                                `/${locale}/analytics?campaignId=${campaign.id}`
                                                            )
                                                        }
                                                    >
                                                        <BarChart3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteCampaign(campaign.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </PageShell>
            </div>
        </div>
    );
}
