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
    viewMode?: 'CLASSIC' | 'COMPACT' | 'STACK';
    isExpanded?: boolean;
    onExpand?: () => void;
}

export function KanbanCard({ lead, onViewDetails, viewMode = 'CLASSIC', isExpanded = true, onExpand }: KanbanCardProps) {
    const t = useTranslations("CRM");
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
                className="opacity-30 bg-blue-500/10 border-2 border-blue-500/40 border-dashed rounded-3xl h-[100px]"
            />
        );
    }

    // --- STACK / DOMINO MODE (Collapsed) ---
    if (viewMode === 'STACK' && !isExpanded) {
        return (
            <div ref={setNodeRef} style={style} onClick={onExpand} className="group cursor-pointer">
                <div className="bg-[#0a0e24]/60 hover:bg-[#11183c]/80 border border-blue-500/10 h-[52px] rounded-2xl px-4 flex items-center justify-between transition-all duration-300 glass hover:translate-y-[-2px]">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-1.5 h-6 rounded-full ${lead.priority === 'HIGH' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-400/40'}`} />
                        <span className="text-xs font-black truncate tracking-wide text-blue-100/90">{lead.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-blue-500/20 text-blue-300/60 font-black">
                            {lead.priority === 'HIGH' ? '🔥' : 'TARGET'}
                        </Badge>
                        <div {...attributes} {...listeners} onClick={e => e.stopPropagation()}>
                            <GripVertical className="h-4 w-4 text-blue-500/20 group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- COMPACT MODE ---
    if (viewMode === 'COMPACT') {
        return (
            <div ref={setNodeRef} style={style}>
                <Card className="cursor-grab active:cursor-grabbing border-blue-500/10 bg-[#0a1129]/80 glass overflow-hidden rounded-2xl shadow-xl">
                    <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-black truncate text-blue-50">{lead.name}</CardTitle>
                        <div {...attributes} {...listeners}>
                            <GripVertical className="h-3 w-3 text-blue-500/20" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="text-[10px] font-black text-primary/80 flex items-center gap-1">
                                <DollarSign className="w-2.5 h-2.5" />
                                {lead.budget || "—"}
                            </div>
                            <Badge className="text-[9px] h-4 border-none bg-blue-500/20 text-blue-300 font-black">{lead.priority}</Badge>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full h-8 text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 border border-blue-500/10 font-bold"
                            onClick={() => onViewDetails?.(lead)}
                        >
                            {t("viewDetails")}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // --- CLASSIC MODE ---
    return (
        <div ref={setNodeRef} style={style} className={viewMode === 'STACK' && isExpanded ? "animate-in zoom-in-95 duration-300" : ""}>
            <Card className="cursor-grab active:cursor-grabbing border-blue-500/10 bg-[#0a1129]/90 glass rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:border-blue-500/30">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div className="flex-1 overflow-hidden">
                        <CardTitle className="text-sm font-black tracking-tight text-blue-50 truncate">
                            {lead.name}
                        </CardTitle>
                        <div className="text-[10px] font-bold flex items-center gap-2 mt-1">
                            <span className="text-blue-400/80 uppercase tracking-tighter">{lead.source}</span>
                            <span className="text-blue-500/30">•</span>
                            <span className="text-blue-200/40">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div {...attributes} {...listeners}>
                        <GripVertical className="h-5 w-5 text-blue-500/10 hover:text-blue-400 transition-colors" />
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3 bg-[#0d1633]/50 p-3 rounded-2xl border border-blue-500/5">
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest">{t("phone")}</span>
                            <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-blue-400" />
                                <span className="text-[11px] font-bold text-blue-100">{lead.phone}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest">{t("budget")}</span>
                            <div className="flex items-center gap-1.5 text-primary">
                                <DollarSign className="h-3 w-3" />
                                <span className="text-[11px] font-black">{lead.budget || "0"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <Badge variant={lead.priority === 'HIGH' ? 'destructive' : 'outline'} className="text-[9px] px-2 py-0.5 h-6 rounded-lg border-blue-500/20 font-black tracking-wider translate-y-[-1px]">
                            {lead.priority}
                        </Badge>
                        {lead.assignedTo && (
                            <div className="flex items-center gap-2 bg-blue-500/5 px-2 py-1 rounded-lg border border-blue-500/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-[9px] font-bold text-blue-200/60 uppercase">
                                    {lead.assignedTo.split('-').pop()}
                                </span>
                            </div>
                        )}
                    </div>

                    <Button
                        size="sm"
                        variant="secondary"
                        className="w-full h-10 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-100 border border-blue-500/20 transition-all shadow-lg hover:shadow-blue-500/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.(lead);
                        }}
                    >
                        <Eye className="h-4 w-4 mr-2 text-blue-400" />
                        {t("viewDetails")}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
