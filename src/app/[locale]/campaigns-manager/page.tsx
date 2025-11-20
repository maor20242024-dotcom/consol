"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
import {
    Plus,
    Trash2,
    Edit2,
    BarChart3,
    Play,
    Pause,
    DollarSign,
    Eye,
} from "lucide-react";
import dynamic from "next/dynamic";

const FloatingDots = dynamic(
    () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
    { ssr: false }
);

export default function CampaignsManagerPage() {
    const t = useTranslations("Dashboard");
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
                    accountId: "default-account", // سيتم تحديثه لاحقاً
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
        if (!confirm("هل أنت متأكد من حذف هذه الحملة؟")) return;

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

    const getStatusColor = (status: string) => {
        const colors: any = {
            draft: "secondary",
            scheduled: "outline",
            active: "success",
            paused: "warning",
            completed: "default",
        };
        return colors[status] || "default";
    };

    const getStatusLabel = (status: string) => {
        const labels: any = {
            draft: "مسودة",
            scheduled: "مجدولة",
            active: "نشطة",
            paused: "موقوفة",
            completed: "مكتملة",
        };
        return labels[status] || status;
    };

    return (
        <div
            className="min-h-screen bg-background text-foreground relative overflow-hidden"
            dir={locale === "ar" ? "rtl" : "ltr"}
        >
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
                <FloatingDots />
            </div>

            <div className="container mx-auto p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-5xl font-bold text-gradient-gold">
                        {locale === "ar" ? "مدير حملات Instagram" : "Instagram Campaigns Manager"}
                    </h1>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="h-12 px-6 text-lg"
                    >
                        <Plus className="w-6 h-6 ml-2" />
                        {locale === "ar" ? "حملة جديدة" : "New Campaign"}
                    </Button>
                </div>

                {/* Create Form */}
                {showForm && (
                    <Card className="glass mb-8 p-8 border-primary/30">
                        <CardHeader>
                            <CardTitle>
                                {locale === "ar" ? "إنشاء حملة جديدة" : "Create New Campaign"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder={locale === "ar" ? "اسم الحملة" : "Campaign Name"}
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="h-12 text-lg"
                            />
                            <Input
                                placeholder={
                                    locale === "ar" ? "الوصف" : "Description (optional)"
                                }
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="h-12 text-lg"
                            />
                            <Input
                                type="number"
                                placeholder={locale === "ar" ? "الميزانية" : "Budget"}
                                value={formData.budget}
                                onChange={(e) =>
                                    setFormData({ ...formData, budget: e.target.value })
                                }
                                className="h-12 text-lg"
                            />
                            <div className="flex gap-4">
                                <Button
                                    onClick={createCampaign}
                                    className="flex-1 h-12 text-lg"
                                >
                                    {locale === "ar" ? "إنشاء" : "Create"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 h-12 text-lg"
                                >
                                    {locale === "ar" ? "إلغاء" : "Cancel"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Campaigns Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <p>{locale === "ar" ? "جاري التحميل..." : "Loading..."}</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <Card className="glass p-12 text-center border-primary/30">
                        <p className="text-muted-foreground text-lg mb-6">
                            {locale === "ar"
                                ? "لم يتم إنشاء أي حملات بعد"
                                : "No campaigns created yet"}
                        </p>
                        <Button onClick={() => setShowForm(true)}>
                            {locale === "ar" ? "إنشاء الحملة الأولى" : "Create First Campaign"}
                        </Button>
                    </Card>
                ) : (
                    <Card className="glass border-primary/30 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        {locale === "ar" ? "اسم الحملة" : "Campaign Name"}
                                    </TableHead>
                                    <TableHead>
                                        {locale === "ar" ? "الحالة" : "Status"}
                                    </TableHead>
                                    <TableHead>
                                        {locale === "ar" ? "الميزانية" : "Budget"}
                                    </TableHead>
                                    <TableHead>
                                        {locale === "ar" ? "الإعلانات" : "Ads"}
                                    </TableHead>
                                    <TableHead>
                                        {locale === "ar" ? "الإجراءات" : "Actions"}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map((campaign) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-medium">
                                            {campaign.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(campaign.status)}>
                                                {getStatusLabel(campaign.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                {campaign.budget || "0"}
                                            </div>
                                        </TableCell>
                                        <TableCell>0</TableCell>
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
            </div>
        </div>
    );
}
