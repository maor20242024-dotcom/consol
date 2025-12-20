"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import dynamic from "next/dynamic";
import { KanbanBoard } from "@/components/crm/kanban-board";
import { getLeads, getPipeline, getFilteredLeads } from "@/actions/crm"; // Updated import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead, Stage } from "@/types/crm";
import { LeadFilters } from "@/components/crm/lead-filters"; // Import LeadFilters

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

    // Initial fetch
    const loadData = async () => {
        try {
            const [fetchedResult, fetchedPipeline] = await Promise.all([
                getFilteredLeads({}), // Use getFilteredLeads instead of getLeads
                getPipeline()
            ]);

            const fetchedLeads = fetchedResult.leads || [];

            // Transform fetchedLeads to LeadWithRelations format
            const transformedLeads: LeadWithRelations[] = fetchedLeads.map((lead: any) => ({
                ...lead,
                email: lead.email || null,
                expectedValue: typeof lead.expectedValue === 'object' ? Number(lead.expectedValue) : (lead.expectedValue ? Number(lead.expectedValue) : null),
                pipeline: lead.pipeline ? {
                    id: lead.pipeline.id,
                    name: lead.pipeline.name
                } : null,
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
                    pipeline: lead.pipeline ? {
                        id: lead.pipeline.id,
                        name: lead.pipeline.name
                    } : null,
                    stage: lead.stage,
                    campaign: lead.campaign,
                }));
                // Use a functional update to ensure we aren't depending on stale state, though setLeads doesn't really depend on prev state here.
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
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/10" />
                <FloatingDots />
            </div>

            <div className="relative h-screen flex flex-col">
                <PageShell
                    title={t("title")}
                    description={t("description")}
                    variant="gradient"
                    actions={
                        <div className="flex items-center gap-2">
                            {/* Import/Export Dialog is self-contained with its button */}
                            <ImportLeadsDialog onSuccess={loadData} />

                            <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")} className="hidden md:block">
                                <TabsList className="bg-primary/10 border-primary/20">
                                    <TabsTrigger value="kanban" className="data-[state=active]:bg-primary"><LayoutGrid className="w-4 h-4 mr-2" />Board</TabsTrigger>
                                    <TabsTrigger value="list" className="data-[state=active]:bg-primary"><List className="w-4 h-4 mr-2" />List</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {view === "kanban" && (
                                <div className="flex bg-muted/50 p-1 rounded-lg border border-primary/10">
                                    <Button
                                        variant={cardDensity === "CLASSIC" ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-8 px-2 text-[10px] font-bold"
                                        onClick={() => setCardDensity("CLASSIC")}
                                    >CLASSIC</Button>
                                    <Button
                                        variant={cardDensity === "COMPACT" ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-8 px-2 text-[10px] font-bold"
                                        onClick={() => setCardDensity("COMPACT")}
                                    >COMPACT</Button>
                                    <Button
                                        variant={cardDensity === "STACK" ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-8 px-2 text-[10px] font-bold"
                                        onClick={() => setCardDensity("STACK")}
                                    >STACK</Button>
                                </div>
                            )}

                            <Button
                                className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-primary/80 shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all"
                                onClick={() => setAddLeadOpen(true)}
                            >
                                <Plus className="w-4 h-4" />
                                {t("addLead")}
                            </Button>
                        </div>
                    }
                >
                    <div className="flex flex-col h-full gap-4">
                        {/* Filters Section */}
                        <div className="bg-card/30 backdrop-blur-xl p-4 rounded-3xl border border-primary/10 shadow-2xl">
                            <LeadFilters onFiltersChange={handleFiltersChange} loading={loading} />
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                                    <LeadListView
                                        leads={leads as Lead[]}
                                        onViewDetails={handleViewDetails}
                                        onRefresh={loadData}
                                    />
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
