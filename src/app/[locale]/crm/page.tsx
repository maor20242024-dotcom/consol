"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Phone, Mail, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), { ssr: false });

export default function CRMPage() {
    const t = useTranslations("Dashboard");
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'en';
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", email: "", budget: "" }); useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const addLead = async () => {
        if (!formData.name || !formData.phone) return;

        try {
            const { error } = await supabase.from("leads").insert([{
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                budget: formData.budget,
                status: "hot",
                source: "CRM"
            }]);

            if (error) throw error;
            setFormData({ name: "", phone: "", email: "", budget: "" });
            setShowForm(false);
            fetchLeads();
        } catch (error) {
            console.error("Error adding lead:", error);
        }
    };

    const deleteLead = async (id: string) => {
        try {
            const { error } = await supabase.from("leads").delete().eq("id", id);
            if (error) throw error;
            fetchLeads();
        } catch (error) {
            console.error("Error deleting lead:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden" dir="rtl">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
                <FloatingDots />
            </div>

            <div className="container mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-5xl font-bold text-gradient-gold">إدارة العملاء - CRM</h1>
                    <Button onClick={() => setShowForm(!showForm)} className="h-12 px-6 text-lg">
                        <Plus className="w-6 h-6 ml-2" />
                        {t("campaigns")}
                    </Button>
                </div>

                {showForm && (
                    <Card className="glass mb-8 p-8 border-primary/30">
                        <CardHeader>
                            <CardTitle>إضافة عميل جديد</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="الاسم"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 text-lg"
                            />
                            <Input
                                placeholder="رقم الهاتف"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-12 text-lg"
                            />
                            <Input
                                placeholder="البريد الإلكتروني"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-12 text-lg"
                            />
                            <Input
                                placeholder="الميزانية"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                className="h-12 text-lg"
                            />
                            <div className="flex gap-4">
                                <Button onClick={addLead} className="flex-1 h-12 text-lg">حفظ</Button>
                                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-12 text-lg">إلغاء</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {loading ? (
                    <div className="text-center text-muted-foreground">جاري التحميل...</div>
                ) : (
                    <Card className="glass border-border/50">
                        <CardContent className="p-0 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-border/50">
                                        <TableHead>الاسم</TableHead>
                                        <TableHead>الهاتف</TableHead>
                                        <TableHead>البريد</TableHead>
                                        <TableHead>الميزانية</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.map((lead: any) => (
                                        <TableRow key={lead.id} className="border-b border-border/50 hover:bg-card/50">
                                            <TableCell className="font-medium">{lead.name}</TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {lead.phone}
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                {lead.email || "-"}
                                            </TableCell>
                                            <TableCell>{lead.budget || "-"}</TableCell>
                                            <TableCell>
                                                <Badge className={lead.status === "hot" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}>
                                                    {lead.status === "hot" ? "🔥 Hot" : "⏳ Warm"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="flex gap-2">
                                                <Button variant="ghost" size="icon" disabled>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteLead(lead.id)} className="text-red-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card className="glass p-6 text-center border-primary/30">
                        <CardContent className="space-y-2">
                            <div className="text-4xl font-bold text-primary">{leads.filter((l: any) => l.status === "hot").length}</div>
                            <p className="text-muted-foreground">عملاء ساخنين</p>
                        </CardContent>
                    </Card>
                    <Card className="glass p-6 text-center border-primary/30">
                        <CardContent className="space-y-2">
                            <div className="text-4xl font-bold text-yellow-400">{leads.filter((l: any) => l.status !== "hot").length}</div>
                            <p className="text-muted-foreground">عملاء دافئين</p>
                        </CardContent>
                    </Card>
                    <Card className="glass p-6 text-center border-primary/30">
                        <CardContent className="space-y-2">
                            <div className="text-4xl font-bold text-blue-400">{leads.length}</div>
                            <p className="text-muted-foreground">إجمالي العملاء</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
