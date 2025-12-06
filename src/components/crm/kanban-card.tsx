import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/crm';
import { GripVertical, Phone, Mail, DollarSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanCardProps {
    lead: Lead;
    onViewDetails?: (lead: Lead) => void;
}

export function KanbanCard({ lead, onViewDetails }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: 'Lead',
            lead,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-primary/10 border-2 border-primary border-dashed rounded-lg h-[150px]"
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between space-y-0">
                    <CardTitle className="text-sm font-medium leading-none">
                        {lead.name}
                    </CardTitle>
                    <div {...attributes} {...listeners}>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </div>
                </CardHeader>
                <CardContent className="p-3">
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                        </div>
                        {lead.budget && (
                            <div className="flex items-center gap-1 font-medium text-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span>{lead.budget}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                            <Badge variant={lead.priority === 'HIGH' ? 'destructive' : 'secondary'} className="text-[10px] px-1 py-0 h-5">
                                {lead.priority}
                            </Badge>
                            <span className="text-[10px] opacity-70">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                        {lead.assignedTo && (
                            <div className="text-[10px] opacity-70 mt-1">
                                Assigned: {lead.assignedTo}
                            </div>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="w-full mt-2 h-7 text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails?.(lead);
                            }}
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
