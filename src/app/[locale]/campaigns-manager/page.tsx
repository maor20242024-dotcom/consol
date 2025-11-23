"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Plus, Trash2, BarChart3, DollarSign } from "lucide-react";
import dynamic from "next/dynamic";

const FloatingDots = dynamic(
    () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
    { ssr: false }
);

export default function CampaignsManagerPage() {
    const t = useTranslations("Campaigns");
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en";

    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        budget: "",
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch("/api/instagram/campaigns");
            const data = await response.json();
            setCampaigns(data.campaigns || []);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const createCampaign = async () => {
        if (!formData.name) return;

        try {
            const response = await fetch("/api/instagram/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountId: "default-account",
                    ...formData,
                    budget: parseFloat(formData.budget) || 0,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setCampaigns([data.campaign, ...campaigns]);
                setFormData({ name: "", description: "", budget: "" });
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
                        <Button
                            onClick={() => setShowForm((prev) => !prev)}
                            className="flex items-center gap-2 h-12 px-6 text-lg"
                        >
                            <Plus className="w-5 h-5" />
                            {t("newCampaign")}
                        </Button>
                    }
                >
                    {showForm && (
                        <Card className="glass mb-8 p-6 border-primary/30">
                            <CardHeader>
                                <CardTitle>{t("newCampaign")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder={t("name")}
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="h-12 text-lg"
                                />
                                <Input
                                    placeholder={t("descriptionField")}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="h-12 text-lg"
                                />
                                <Input
                                    type="number"
                                    placeholder={t("budget")}
                                    value={formData.budget}
                                    onChange={(e) =>
                                        setFormData({ ...formData, budget: e.target.value })
                                    }
                                    className="h-12 text-lg"
                                />
                                <div className="flex gap-4">
                                    <Button onClick={createCampaign} className="flex-1 h-12 text-lg">
                                        {t("create")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 h-12 text-lg"
                                    >
                                        {t("cancel")}
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
                                                    className={`px-2 py-1 rounded-full text-sm ${
                                                        statusStyles[campaign.status] ||
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
