'use client';

import { useState, useMemo } from 'react';
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

    const leadsByStage = useMemo(() => {
        const grouped: Record<string, Lead[]> = {};
        stages.forEach((stage) => {
            grouped[stage.id] = leads.filter((lead) => lead.stageId === stage.id);
        });
        return grouped;
    }, [stages, leads]);

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
            <div className="flex h-[calc(100vh-250px)] gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-2">
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
