'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { updateLeadStage } from '@/actions/crm';
import { useToast } from '@/hooks/use-toast';
import { Stage, Lead } from '@/types/crm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KanbanBoardProps {
    initialStages: Stage[];
    initialLeads: Lead[];
    onViewDetails?: (lead: Lead) => void;
    viewMode?: 'CLASSIC' | 'COMPACT' | 'STACK';
}

export function KanbanBoard({ initialStages, initialLeads, onViewDetails, viewMode = 'CLASSIC' }: KanbanBoardProps) {
    const [stages] = useState<Stage[]>(initialStages);
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const { toast } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [sortBy, setSortBy] = useState<'PRIORITY' | 'VALUE' | 'ACTIVITY' | 'MANUAL'>('MANUAL');

    // Load preference on mount
    useEffect(() => {
        const savedSort = localStorage.getItem('crm_board_sort');
        if (savedSort) {
            setSortBy(savedSort as any);
        }
    }, []);

    const handleSortChange = (value: string) => {
        setSortBy(value as any);
        localStorage.setItem('crm_board_sort', value);
    };

    const leadsByStage = useMemo(() => {
        const grouped: Record<string, Lead[]> = {};
        stages.forEach((stage) => {
            let stageLeads = leads.filter((lead) => lead.stageId === stage.id);

            // Apply Sorting
            if (sortBy === 'PRIORITY') {
                const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                stageLeads.sort((a, b) => (priorityWeight[b.priority as keyof typeof priorityWeight] || 0) - (priorityWeight[a.priority as keyof typeof priorityWeight] || 0));
            } else if (sortBy === 'VALUE') {
                stageLeads.sort((a, b) => (b.expectedValue || 0) - (a.expectedValue || 0));
            } else if (sortBy === 'ACTIVITY') {
                stageLeads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            }
            // MANUAL uses default array order (presumed DB order or index)

            grouped[stage.id] = stageLeads;
        });
        return grouped;
    }, [stages, leads, sortBy]);

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === 'Lead') {
            setActiveLead(event.active.data.current.lead);
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveALead = active.data.current?.type === 'Lead';
        const isOverALead = over.data.current?.type === 'Lead';
        const isOverAStage = over.data.current?.type === 'Stage';

        if (!isActiveALead) return;

        // Dropping a Lead over another Lead
        if (isActiveALead && isOverALead) {
            setLeads((leads) => {
                const activeIndex = leads.findIndex((l) => l.id === activeId);
                const overIndex = leads.findIndex((l) => l.id === overId);

                if (leads[activeIndex].stageId !== leads[overIndex].stageId) {
                    const newLeads = [...leads];
                    newLeads[activeIndex] = { ...newLeads[activeIndex], stageId: leads[overIndex].stageId };
                    return newLeads;
                }
                return leads;
            });
        }

        // Dropping a Lead over a Stage (empty column)
        if (isActiveALead && isOverAStage) {
            setLeads((leads) => {
                const activeIndex = leads.findIndex((l) => l.id === activeId);
                if (leads[activeIndex].stageId !== overId) {
                    const newLeads = [...leads];
                    newLeads[activeIndex] = { ...newLeads[activeIndex], stageId: String(overId) };
                    return newLeads;
                }
                return leads;
            });
        }
    }

    async function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveLead(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const isOverAStage = over.data.current?.type === 'Stage';
        const isOverALead = over.data.current?.type === 'Lead';

        let newStageId = '';

        if (isOverAStage) {
            newStageId = overId;
        } else if (isOverALead) {
            const overLead = leads.find(l => l.id === overId);
            if (overLead?.stageId) {
                newStageId = overLead.stageId;
            }
        }

        if (newStageId) {
            // Optimistic update already happened in DragOver, now persist
            const result = await updateLeadStage(activeId, newStageId);
            if (!result.success) {
                toast({
                    title: "Error",
                    description: "Failed to update lead stage",
                    variant: "destructive"
                });
                // Revert changes if needed (omitted for brevity, but recommended for production)
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            {/* Board Controls */}
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="text-white/50 text-xs font-bold uppercase tracking-widest">
                    {leads.length} Active Leads
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Sort By:</span>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[140px] h-8 bg-blue-950/40 border-blue-500/20 text-blue-100 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a1129] border-blue-500/30 text-blue-100">
                            <SelectItem value="MANUAL" className="font-bold text-[10px] uppercase focus:bg-blue-500/20">Default</SelectItem>
                            <SelectItem value="PRIORITY" className="font-bold text-[10px] uppercase focus:bg-blue-500/20">Priority</SelectItem>
                            <SelectItem value="VALUE" className="font-bold text-[10px] uppercase focus:bg-blue-500/20">Value</SelectItem>
                            <SelectItem value="ACTIVITY" className="font-bold text-[10px] uppercase focus:bg-blue-500/20">Last Activity</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex h-[calc(100vh-300px)] gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-2">
                {stages.map((stage) => (
                    <div key={stage.id} className="snap-center">
                        <KanbanColumn
                            stage={stage}
                            leads={leadsByStage[stage.id] || []}
                            onViewDetails={onViewDetails}
                            viewMode={viewMode}
                        />
                    </div>
                ))}
            </div>

            <DragOverlay dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeLead ? (
                    <div className="scale-105 rotate-3 transition-transform duration-200 shadow-2xl">
                        <KanbanCard lead={activeLead} viewMode="CLASSIC" />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
