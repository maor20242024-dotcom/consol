"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, Calendar, FileText, Instagram, CheckCircle2 } from "lucide-react";

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
            case "CALL":
                return <Phone className="w-4 h-4" />;
            case "EMAIL":
                return <Mail className="w-4 h-4" />;
            case "WHATSAPP":
                return <MessageSquare className="w-4 h-4" />;
            case "INSTAGRAM":
                return <Instagram className="w-4 h-4" />;
            case "MEETING":
                return <Calendar className="w-4 h-4" />;
            case "REMINDER":
                return <Calendar className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "CALL":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "EMAIL":
                return "bg-purple-500/20 text-purple-400 border-purple-500/30";
            case "WHATSAPP":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "INSTAGRAM":
                return "bg-pink-500/20 text-pink-400 border-pink-500/30";
            case "MEETING":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            case "REMINDER":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No activities yet. Add your first interaction!
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="relative pl-8 pb-4">
                        {/* Timeline line */}
                        {index !== activities.length - 1 && (
                            <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
                        )}

                        {/* Icon */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${getTypeColor(activity.type)}`}>
                            {getIcon(activity.type)}
                        </div>

                        {/* Content */}
                        <div className="bg-card/50 border rounded-lg p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Badge className={getTypeColor(activity.type)}>
                                        {activity.type}
                                    </Badge>
                                    {!activity.isCompleted && (
                                        <Badge variant="outline" className="text-xs">
                                            Scheduled
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(activity.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <p className="text-sm whitespace-pre-wrap">{activity.content}</p>

                            {activity.aiSummary && (
                                <div className="bg-primary/5 border border-primary/20 rounded p-2 mt-2">
                                    <p className="text-xs font-medium text-primary mb-1">AI Summary:</p>
                                    <p className="text-xs text-muted-foreground">{activity.aiSummary}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {activity.performedBy && (
                                    <span>By: {activity.performedBy}</span>
                                )}
                                {activity.duration && (
                                    <span>Duration: {activity.duration} min</span>
                                )}
                                {activity.scheduledFor && (
                                    <span>
                                        Follow-up: {new Date(activity.scheduledFor).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
