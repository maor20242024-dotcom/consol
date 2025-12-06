import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Stage, Lead } from '@/types/crm';
import { KanbanCard } from './kanban-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
    stage: Stage;
    leads: Lead[];
    onViewDetails?: (lead: Lead) => void;
}

export function KanbanColumn({ stage, leads, onViewDetails }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: stage.id,
        data: {
            type: 'Stage',
            stage,
        },
    });

    const leadIds = leads.map((l) => l.id);

    return (
        <div className="flex flex-col h-full min-w-[280px] max-w-[280px] bg-muted/30 rounded-lg border">
            {/* Column Header */}
            <div className="p-3 border-b flex items-center justify-between bg-background/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold text-sm">{stage.name}</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                    {leads.length}
                </Badge>
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} className="flex-1 p-2">
                <ScrollArea className="h-full pr-3">
                    <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-2 min-h-[100px]">
                            {leads.map((lead) => (
                                <KanbanCard key={lead.id} lead={lead} onViewDetails={onViewDetails} />
                            ))}
                        </div>
                    </SortableContext>
                </ScrollArea>
            </div>
        </div>
    );
}
