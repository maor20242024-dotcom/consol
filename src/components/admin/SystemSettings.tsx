
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Terminal, Save, RefreshCw } from "lucide-react";

export function SystemSettings() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Settings State
    const [corePrompt, setCorePrompt] = useState("");
    const [overlayPrompt, setOverlayPrompt] = useState("");
    const [simulationMode, setSimulationMode] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();

            if (res.ok) {
                setCorePrompt(data.AI_CORE_PROMPT || "System Default: You are Zeta, an advanced AI Real Estate Agent...");
                setOverlayPrompt(data.AI_OVERLAY_PROMPT || "");
                setSimulationMode(data.SIMULATION_MODE === true || data.SIMULATION_MODE === "true");
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const saveSetting = async (key: string, value: any) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });

            if (res.ok) {
                toast({ title: "Configuration Updated", description: `${key} saved successfully.` });
                if (key === 'SIMULATION_MODE') {
                    // Force refresh or update context if needed, for now state is enough
                    setSimulationMode(value);
                }
            } else {
                toast({ title: "Error", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-white/20">Loading Nexus Configuration...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-black text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        AI Core Protocols (Read-Only)
                    </h4>
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl h-64 overflow-y-auto text-xs font-mono text-white/60 whitespace-pre-wrap leading-relaxed">
                        {corePrompt}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-black text-primary/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Overlay Directives
                    </h4>
                    <textarea
                        className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors resize-none font-mono"
                        placeholder="Enter additional instructions to override specific AI behaviors..."
                        value={overlayPrompt}
                        onChange={(e) => setOverlayPrompt(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end">
                        <Button
                            className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-xl"
                            onClick={() => saveSetting('AI_OVERLAY_PROMPT', overlayPrompt)}
                            disabled={saving}
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Overlays
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-green-500/20 transition-all">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Terminal className="w-5 h-5 text-green-400" />
                            <h4 className="text-lg font-black text-white uppercase tracking-widest">Simulation Mode</h4>
                        </div>
                        <p className="text-xs text-white/40 max-w-[250px]">
                            Enables "God Mode" features: Database Reset, Lead Injection, and randomized event triggers.
                            <br /><span className="text-red-400 mt-2 block">WARNING: Production data risk if enabled.</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <Switch
                            checked={simulationMode}
                            onCheckedChange={(checked) => saveSetting('SIMULATION_MODE', checked)}
                            className="data-[state=checked]:bg-green-500"
                        />
                        {simulationMode && <Badge variant="outline" className="border-green-500/20 text-green-400 text-[10px] animate-pulse">ACTIVE</Badge>}
                    </div>
                </div>

                <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Nexus Statistics</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                            <span className="text-xs text-white/60 uppercase tracking-wider">Language Model</span>
                            <span className="text-xs font-mono text-primary font-bold">GPT-4-Turbo</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                            <span className="text-xs text-white/60 uppercase tracking-wider">Avg Response Time</span>
                            <span className="text-xs font-mono text-green-400 font-bold">~800ms</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                            <span className="text-xs text-white/60 uppercase tracking-wider">Last Sync</span>
                            <span className="text-xs font-mono text-white/40">{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
