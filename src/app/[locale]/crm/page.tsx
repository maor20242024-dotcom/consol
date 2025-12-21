"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Sparkles, Filter, Database, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { KanbanBoard } from "@/components/crm/kanban-board";
import { getLeads, getPipeline, getFilteredLeads } from "@/actions/crm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead, Stage } from "@/types/crm";
import { LeadFilters } from "@/components/crm/lead-filters";

type LeadWithRelations = Omit<Lead, 'pipeline' | 'stage' | 'campaign'> & {
    pipeline: { id: string; name: string } | null;
    stage: Stage | null;
    campaign: { id: string; name: string } | null;
};
import { AddLeadDialog } from "@/components/crm/add-lead-dialog";
import { LeadDetailsDialog } from "@/components/crm/lead-details-dialog";
import { ImportLeadsDialog } from "@/components/crm/import-leads-dialog";
import { LeadListView } from "@/components/crm/lead-list-view";

const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), { ssr: false });

export default function CRMPage() {
    const t = useTranslations("CRM");
    const [leads, setLeads] = useState<LeadWithRelations[]>([]);
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"kanban" | "list">("kanban");
    const [cardDensity, setCardDensity] = useState<"CLASSIC" | "COMPACT" | "STACK">("CLASSIC");
    const [addLeadOpen, setAddLeadOpen] = useState(false);
    const [pipelineId, setPipelineId] = useState("");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const loadData = async () => {
        try {
            const [fetchedResult, fetchedPipeline] = await Promise.all([
                getFilteredLeads({}),
                getPipeline()
            ]);

            const fetchedLeads = fetchedResult.leads || [];
            const transformedLeads: LeadWithRelations[] = fetchedLeads.map((lead: any) => ({
                ...lead,
                email: lead.email || null,
                expectedValue: typeof lead.expectedValue === 'object' ? Number(lead.expectedValue) : (lead.expectedValue ? Number(lead.expectedValue) : null),
                pipeline: lead.pipeline ? { id: lead.pipeline.id, name: lead.pipeline.name } : null,
                stage: lead.stage,
                campaign: lead.campaign,
            }));
            setLeads(transformedLeads);
            setStages(fetchedPipeline.stages);
            setPipelineId(fetchedPipeline.id);
        } catch (error) {
            console.error("Failed to load CRM data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFiltersChange = useCallback(async (filters: any) => {
        setLoading(true);
        try {
            const result = await getFilteredLeads(filters);
            if (result.success && result.leads) {
                const transformedLeads: LeadWithRelations[] = result.leads.map((lead: any) => ({
                    ...lead,
                    email: lead.email || null,
                    expectedValue: typeof lead.expectedValue === 'object' ? Number(lead.expectedValue) : (lead.expectedValue ? Number(lead.expectedValue) : null),
                    pipeline: lead.pipeline ? { id: lead.pipeline.id, name: lead.pipeline.name } : null,
                    stage: lead.stage,
                    campaign: lead.campaign,
                }));
                setLeads(transformedLeads);
            }
        } catch (error) {
            console.error("Filter error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleViewDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setDetailsOpen(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden p-6 lg:p-8">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.05),transparent_50%)]" />
                <FloatingDots />
            </div>

            <div className="relative h-full flex flex-col">
                <PageShell
                    title={t("title")}
                    description={t("description")}
                    variant="gradient"
                    actions={
                        <div className="flex items-center gap-3">
                            <ImportLeadsDialog onSuccess={loadData} />

                            <div className="h-10 w-[1px] bg-primary/20 mx-2 hidden md:block" />

                            <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")} className="hidden md:block">
                                <TabsList className="bg-primary/5 border border-primary/20 p-1 rounded-2xl">
                                    <TabsTrigger value="kanban" className="rounded-xl data-[state=active]:bg-primary"><LayoutGrid className="w-4 h-4 mr-2" />Board</TabsTrigger>
                                    <TabsTrigger value="list" className="rounded-xl data-[state=active]:bg-primary"><List className="w-4 h-4 mr-2" />List</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {view === "kanban" && (
                                <div className="flex bg-primary/5 p-1 rounded-2xl border border-primary/20">
                                    {(["CLASSIC", "COMPACT", "STACK"] as const).map((density) => (
                                        <Button
                                            key={density}
                                            variant={cardDensity === density ? "secondary" : "ghost"}
                                            size="sm"
                                            className="h-8 px-3 text-[10px] font-black tracking-widest rounded-xl transition-all"
                                            onClick={() => setCardDensity(density)}
                                        >{density}</Button>
                                    ))}
                                </div>
                            )}

                            <Button
                                className="flex items-center gap-2 h-11 px-6 bg-primary hover:bg-primary/80 text-primary-foreground font-black tracking-tight rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.25)] hover:shadow-primary/40 transition-all active:scale-95"
                                onClick={() => setAddLeadOpen(true)}
                            >
                                <Plus className="w-5 h-5 stroke-[3px]" />
                                {t("addLead")}
                            </Button>
                        </div>
                    }
                >
                    <div className="flex flex-col h-full gap-8">
                        {/* Summary Header */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                            {[
                                { label: "Total Leads", value: leads.length, icon: Users, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
                                { label: "Pipeline Value", value: `${leads.reduce((acc, lead) => acc + (Number(lead.expectedValue) || 0), 0).toLocaleString()} AED`, icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
                                { label: "Premium Hot", value: leads.filter(l => l.priority === 'HIGH').length, icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" },
                                { label: "Lead Velocity", value: "+12%", icon: Filter, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20" },
                            ].map((stat, i) => (
                                <div key={i} className={`glass p-6 rounded-[2.5rem] border ${stat.border} ${stat.bg} flex items-start justify-between group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden shadow-2xl`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <stat.icon className="w-16 h-16" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-2">{stat.label}</p>
                                        <p className="text-3xl font-black text-white group-hover:text-primary transition-colors tracking-tighter">{stat.value}</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border} shadow-lg relative z-10`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Filters Section */}
                        <div className="glass rounded-[3rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-5 transition-opacity">
                                <Filter className="w-48 h-48" />
                            </div>
                            <div className="relative z-10">
                                <LeadFilters onFiltersChange={handleFiltersChange} loading={loading} />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                    <div className="p-8 rounded-full bg-black/40 border border-primary/20 backdrop-blur-2xl relative animate-in zoom-in-50 duration-500">
                                        <Loader2 className="w-12 h-12 text-primary animate-[spin_3s_linear_infinite]" />
                                    </div>
                                </div>
                                <div className="mt-8 flex flex-col items-center gap-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 animate-pulse">Synchronizing Node</p>
                                    <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-hidden">
                                {view === "kanban" ? (
                                    <KanbanBoard
                                        initialStages={stages}
                                        initialLeads={leads as Lead[]}
                                        onViewDetails={handleViewDetails}
                                        viewMode={cardDensity}
                                    />
                                ) : (
                                    <div className="glass rounded-[2rem] border border-primary/10 overflow-hidden">
                                        <LeadListView
                                            leads={leads as Lead[]}
                                            onViewDetails={handleViewDetails}
                                            onRefresh={loadData}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </PageShell>
            </div>

            <AddLeadDialog
                open={addLeadOpen}
                onOpenChange={setAddLeadOpen}
                pipelineId={pipelineId}
                firstStageId={stages[0]?.id || ""}
                onLeadCreated={loadData}
            />

            <LeadDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                lead={selectedLead}
            />
        </div>
    );
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);
