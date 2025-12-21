import { useTranslations } from 'next-intl';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/crm';
import { GripVertical, Phone, Mail, DollarSign, Eye, Clock, AlertTriangle, User } from 'lucide-react';
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

    // Helper for English Date Format DD/MM/YYYY
    const appDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Helper for Relative Time (Simple)
    const timeAgo = (date: Date | string) => {
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return `${diffDays}d ago`;
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
                                {lead.expectedValue ? Number(lead.expectedValue).toLocaleString('en-US') : "—"}
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

    // --- CLASSIC MODE (Enhanced) ---
    return (
        <div ref={setNodeRef} style={style} className={viewMode === 'STACK' && isExpanded ? "animate-in zoom-in-95 duration-300" : ""}>
            <Card className={`cursor-grab active:cursor-grabbing border-white/5 bg-black/40 backdrop-blur-2xl glass rounded-[2.5rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-primary/20 group relative ${lead.priority === 'HIGH' ? 'shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)] border-red-500/20' : ''}`}>

                {/* Dynamic Gradient Border Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Hot Lead Pulsing Indicator */}
                {lead.priority === 'HIGH' && (
                    <div className="absolute top-0 right-0 p-3 z-20">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </div>
                )}

                {/* Priority Indicator Stripe */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 transition-all duration-500 ${lead.priority === 'HIGH' ? 'bg-red-500 shadow-[2px_0_15px_rgba(239,68,68,0.4)]' :
                    lead.priority === 'MEDIUM' ? 'bg-amber-400 shadow-[2px_0_15px_rgba(251,191,36,0.3)]' :
                        'bg-blue-400/40'
                    }`} />

                <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between space-y-0 relative z-10">
                    <div className="flex-1 overflow-hidden ml-2 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                            {/* Last Interaction Badge */}
                            <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-white/10 text-white/40 bg-white/5 font-mono gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {timeAgo(lead.updatedAt)}
                            </Badge>
                        </div>
                        <CardTitle className="text-base font-black tracking-tight text-white group-hover:text-primary transition-colors duration-300 truncate">
                            {lead.name}
                        </CardTitle>
                        <div className="text-[10px] font-black flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="bg-primary/5 text-primary/60 border-primary/10 rounded-lg text-[9px] px-2 py-0 uppercase tracking-tighter">
                                {lead.source}
                            </Badge>
                            <span className="text-white/10">•</span>
                            <span className="text-white/20 uppercase tracking-widest font-mono">{appDate(lead.createdAt)}</span>
                        </div>
                    </div>
                    <div {...attributes} {...listeners} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <GripVertical className="h-5 w-5 text-white/10 group-hover:text-primary/40 transition-colors" />
                    </div>
                </CardHeader>

                <CardContent className="p-6 pt-2 space-y-5 relative z-10">
                    <div className="flex flex-col gap-4 bg-white/[0.02] p-5 rounded-[1.5rem] border border-white/[0.05] backdrop-blur-sm group-hover:bg-white/[0.04] transition-colors">
                        {/* Removed Phone/Email to de-clutter as per request ("تقليل النصوص الثانوية") */}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">{t("budget")}</span>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-sm font-black text-emerald-400 italic truncate font-mono">
                                    {lead.expectedValue ? Number(lead.expectedValue).toLocaleString('en-US') : "0"} <span className="text-[9px] text-emerald-400/50 not-italic">AED</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <Badge variant="outline" className={`text-[9px] px-3 py-1 h-7 rounded-xl font-black tracking-widest border-none shadow-inner ${lead.priority === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                            lead.priority === 'MEDIUM' ? 'bg-amber-400/10 text-amber-400' :
                                'bg-blue-400/10 text-blue-400'
                            }`}>
                            {lead.priority}
                        </Badge>

                        {lead.assignedTo ? (
                            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 group/owner group-hover:border-primary/30 transition-all">
                                <User className="w-3 h-3 text-primary" />
                                <span className="text-[9px] font-black text-primary/80 uppercase tracking-tighter">
                                    {/* Extract First Name Attempt */}
                                    {lead.assignedTo.includes('@') ? lead.assignedTo.split('@')[0] : lead.assignedTo.split('-').pop()}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 opacity-30">
                                <span className="text-[9px] font-black uppercase">Unassigned</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="w-full h-12 text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl bg-white/5 hover:bg-primary hover:text-black hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all duration-300 border border-white/5 active:scale-95"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails?.(lead);
                            }}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {t("viewDetails")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
