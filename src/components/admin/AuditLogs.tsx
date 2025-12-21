
"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, User, Clock } from "lucide-react";

interface Log {
    id: string;
    action: string;
    details: string;
    user: string;
    role: string;
    createdAt: string;
}

export function AuditLogs() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/audit?limit=50');
            const data = await res.json();
            if (Array.isArray(data)) {
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to load audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-white/20 animate-pulse">Loading Security Protocols...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    System Audit Trail
                </h3>
                <Badge variant="outline" className="border-white/10 font-mono text-xs">
                    {logs.length} EVENTS LOGGED
                </Badge>
            </div>

            <ScrollArea className="h-[600px] w-full pr-4">
                <div className="space-y-3">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-white/30">
                            No audit records found. System clean.
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="group p-4 bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all rounded-xl flex items-start gap-4">
                                <div className={`mt-1 w-2 h-2 rounded-full ${getActionColor(log.action)} shadow-[0_0_10px_currentColor]`} />

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-black text-sm text-white uppercase tracking-tight">
                                            {log.action.replace('_', ' ')}
                                        </p>
                                        <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <p className="text-xs text-white/60 font-mono leading-relaxed">
                                        {log.details || "No details provided."}
                                    </p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-[9px] text-white/40 border-none flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {log.user}
                                        </Badge>
                                        <Badge variant="outline" className="border-white/5 text-[9px] text-primary/50 uppercase">
                                            {log.role}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

function getActionColor(action: string) {
    if (action.includes('DELETE') || action.includes('RESET')) return 'bg-red-500 text-red-500';
    if (action.includes('CREATE') || action.includes('INJECT')) return 'bg-green-500 text-green-500';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-yellow-500 text-yellow-500';
    return 'bg-blue-500 text-blue-500'; // Default / Read
}
