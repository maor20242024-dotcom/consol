import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, Calendar, FileText, Instagram, CheckCircle2, MessageCircle } from "lucide-react";

interface Activity {
    id: string;
    type: string;
    content: string;
    performedBy: string | null;
    scheduledFor: Date | null;
    aiSummary: string | null;
    duration: number | null;
    isCompleted: boolean;
    createdAt: Date;
}

interface ActivityTimelineProps {
    activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "CALL": return <Phone className="w-4 h-4" />;
            case "EMAIL": return <Mail className="w-4 h-4" />;
            case "WHATSAPP": return <MessageCircle className="w-4 h-4" />;
            case "INSTAGRAM": return <Instagram className="w-4 h-4" />;
            case "MEETING": return <Calendar className="w-4 h-4" />;
            case "REMINDER": return <Calendar className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "CALL": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "EMAIL": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
            case "WHATSAPP": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "INSTAGRAM": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
            case "MEETING": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            case "REMINDER": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
        }
    };

    if (activities.length === 0) {
        return (
            <div className="text-center py-20 bg-blue-950/10 border border-blue-500/10 border-dashed rounded-[2.5rem] text-blue-400/40">
                <div className="bg-blue-500/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/10">
                    <FileText className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-black uppercase tracking-[0.2em] text-[10px]">No operational records found for this asset.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-blue-500/40 before:via-blue-500/10 before:to-transparent">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="relative pl-12 group">
                        {/* Icon */}
                        <div className={`absolute left-0 top-0 w-8 h-8 rounded-xl flex items-center justify-center z-10 shadow-lg border-2 ${getTypeColor(activity.type)} transition-transform group-hover:scale-110`}>
                            {getIcon(activity.type)}
                        </div>

                        {/* Content Card */}
                        <div className="bg-blue-950/20 border border-blue-500/10 rounded-[1.5rem] p-6 shadow-xl hover:bg-blue-900/10 transition-all duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={`font-black tracking-widest text-[9px] uppercase px-2 py-0.5 border-none ${getTypeColor(activity.type)}`}>
                                        {activity.type}
                                    </Badge>
                                    {!activity.isCompleted && (
                                        <Badge className="bg-orange-500/20 text-orange-400 border-none text-[9px] font-black uppercase tracking-widest">
                                            SCHEDULED
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-[10px] font-mono text-blue-500/40 font-bold">
                                    {new Date(activity.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <p className="text-sm leading-relaxed text-blue-50/90 font-medium mb-5">{activity.content}</p>

                            {activity.aiSummary && (
                                <div className="bg-blue-500/5 border-l-4 border-blue-500/40 p-4 rounded-r-2xl mb-5 backdrop-blur-sm">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> ZETA INTEL ANALYSIS
                                    </p>
                                    <p className="text-[13px] text-blue-100/70 italic leading-relaxed">"{activity.aiSummary}"</p>
                                </div>
                            )}

                            <div className="flex items-center gap-8 text-[9px] font-black text-blue-500/30 uppercase tracking-[0.2em] pt-4 border-t border-blue-500/5">
                                {activity.performedBy && (
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-40">OPERATOR:</span>
                                        <span className="text-blue-100 font-bold opacity-80">{activity.performedBy.split('-').pop() || activity.performedBy}</span>
                                    </div>
                                )}
                                {activity.duration && (
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-40">SESSION:</span>
                                        <span className="text-blue-100 font-bold opacity-80">{activity.duration} MIN</span>
                                    </div>
                                )}
                                {activity.scheduledFor && !activity.isCompleted && (
                                    <div className="flex items-center gap-2 text-orange-400/80">
                                        <Calendar className="w-4 h-4 opacity-40" />
                                        <span>SEQUENCED: {new Date(activity.scheduledFor).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
