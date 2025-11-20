"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneIncoming, Mic, MicOff, Crown, Zap, Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), { ssr: false });

export default function VoiceCallCenter() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [campaign, setCampaign] = useState("Villa Palm Jumeirah - Exclusive Offer");
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "active" | "ended">("idle");
  const [callId, setCallId] = useState<string>("");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "active") {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Simulate transcript updates
  useEffect(() => {
    if (callStatus === "active") {
      const messages = [
        "🤴 Emperor: Hello " + (name.split(" ")[0] || "valued client") + ", this is the Emperor from IMPERIUM GATE.",
        "🤴 Emperor: I have an exclusive offer for you in " + campaign + ".",
        "🎯 Client: Tell me more about it...",
        "🤴 Emperor: Our properties start from 5 million AED with exclusive payment plans.",
        "🤴 Emperor: Would you like to schedule a private viewing?",
        "🎯 Client: Yes, that sounds interesting.",
        "🤴 Emperor: Perfect! I'll arrange a VIP tour for you this weekend.",
        "✅ Deal Closed Successfully!"
      ];

      messages.forEach((msg, index) => {
        setTimeout(() => {
          setTranscript(prev => [...prev, msg]);
        }, index * 3000);
      });

      // Auto end call after all messages
      setTimeout(() => {
        setCallStatus("ended");
        setIsCalling(false);
      }, messages.length * 3000 + 2000);
    }
  }, [callStatus, name, campaign]);

  const initiateRoyalCall = async () => {
    if (!phone || !name) return;

    setIsCalling(true);
    setCallStatus("ringing");
    setTranscript([]);
    setCallDuration(0);

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, campaign })
      });

      const data = await res.json();

      if (data.success) {
        setCallId(data.callId);
        setTimeout(() => setCallStatus("active"), 2000);
      } else {
        setCallStatus("ended");
        setIsCalling(false);
      }
    } catch (error) {
      console.error("Call error:", error);
      setCallStatus("ended");
      setIsCalling(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <FloatingDots />
      </div>

      <div className="container mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent mb-4">
            IMPERIUM VOICE™
          </h1>
          <p className="text-2xl text-muted-foreground mb-4">
            Royal AI Call Center - Powered by Intelligence
          </p>
          <Badge className="text-lg px-6 py-2 bg-green-500/20 text-green-400 border-green-500/30">
            <Activity className="w-5 h-5 mr-2 animate-pulse" />
            24/7 Active – 0 Seconds Wait Time
          </Badge>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Call Initiator */}
          <Card className="glass border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Start Royal Call</CardTitle>
                  <p className="text-muted-foreground">The Emperor is ready to close</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                placeholder="Client Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-lg"
                disabled={isCalling}
              />
              <Input
                placeholder="Phone Number (e.g., +971501234567)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 text-lg"
                type="tel"
                disabled={isCalling}
              />
              <Input
                placeholder="Campaign Name"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="h-14 text-lg"
                disabled={isCalling}
              />
              <Button
                size="lg"
                className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90"
                onClick={initiateRoyalCall}
                disabled={isCalling || !phone || !name}
              >
                {isCalling ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    {callStatus === "ringing" ? "Calling..." : "Call in Progress..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Phone className="w-7 h-7" />
                    Start Call Now
                  </div>
                )}
              </Button>

              {/* Call Stats */}
              {callStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-3 gap-4 pt-4"
                >
                  <div className="text-center p-4 bg-card/50 rounded-lg border border-border/50">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-primary">{formatDuration(callDuration)}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="text-center p-4 bg-card/50 rounded-lg border border-border/50">
                    <Mic className="w-6 h-6 mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold text-green-400">
                      {callStatus === "active" ? "LIVE" : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                  <div className="text-center p-4 bg-card/50 rounded-lg border border-border/50">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                    <p className="text-2xl font-bold text-yellow-400">
                      {transcript.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Live Transcript */}
          <Card className="glass border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic className={`w-8 h-8 ${callStatus === "active" ? "text-green-400 animate-pulse" : "text-primary"}`} />
                  <CardTitle className="text-2xl font-bold">Live Transcript</CardTitle>
                </div>
                {callStatus === "active" && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                    RECORDING
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-card/50 rounded-2xl p-6 min-h-[500px] max-h-[500px] overflow-y-auto border border-border/50">
                {callStatus === "idle" ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Zap className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                      <p className="text-xl text-muted-foreground">
                        Start a call to see live transcript
                      </p>
                    </div>
                  </div>
                ) : callStatus === "ringing" ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <PhoneIncoming className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
                      <p className="text-2xl font-bold text-primary">Ringing...</p>
                      <p className="text-muted-foreground mt-2">Waiting for answer</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {transcript.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className={`p-4 rounded-lg ${msg.includes("Emperor")
                            ? "bg-primary/10 border-l-4 border-primary"
                            : msg.includes("Client")
                              ? "bg-blue-500/10 border-l-4 border-blue-500"
                              : "bg-green-500/10 border-l-4 border-green-500 text-center"
                            }`}
                        >
                          <p className="text-sm font-medium">{msg}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {callStatus === "ended" && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/30"
                      >
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <p className="text-xl font-bold text-green-400">Call Completed Successfully</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Total Duration: {formatDuration(callDuration)}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}