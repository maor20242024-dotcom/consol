import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Stage, Lead } from '@/types/crm';
import { KanbanCard } from './kanban-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
interface KanbanColumnProps {
    stage: Stage;
    leads: Lead[];
    onViewDetails?: (lead: Lead) => void;
    viewMode?: 'CLASSIC' | 'COMPACT' | 'STACK';
}

export function KanbanColumn({ stage, leads, onViewDetails, viewMode = 'CLASSIC' }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: stage.id,
        data: {
            type: 'Stage',
            stage,
        },
    });

    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(leads[0]?.id || null);

    const leadIds = leads.map((l) => l.id);

    return (
        <div className={`flex flex-col h-full bg-muted/30 rounded-3xl border border-primary/10 glass transition-all duration-500 ${viewMode === 'COMPACT' ? 'min-w-[220px] max-w-[220px]' : 'min-w-[300px] max-w-[300px]'}`}>
            {/* Column Header */}
            <div className="p-4 border-b border-primary/5 flex items-center justify-between bg-primary/5 rounded-t-3xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                        style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-black text-xs tracking-widest uppercase opacity-70">{stage.name}</h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/20 bg-primary/10">
                    {leads.length}
                </Badge>
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} className="flex-1 p-3 overflow-hidden">
                <ScrollArea className="h-full pr-3">
                    <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
                        <div className={`flex flex-col min-h-[150px] transition-all duration-500 ${viewMode === 'STACK' ? 'gap-1' : 'gap-3'}`}>
                            {leads.map((lead, index) => (
                                <KanbanCard
                                    key={lead.id}
                                    lead={lead}
                                    onViewDetails={onViewDetails}
                                    viewMode={viewMode}
                                    isExpanded={viewMode === 'STACK' ? expandedLeadId === lead.id : true}
                                    onExpand={() => setExpandedLeadId(lead.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </ScrollArea>
            </div>
        </div>
    );
}
