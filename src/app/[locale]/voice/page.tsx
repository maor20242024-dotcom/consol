"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneIncoming, Mic, MicOff, Crown, Zap, Activity } from "lucide-react";

export default function VoiceCallCenter() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [campaign, setCampaign] = useState("فيلا نخيل جميرا - عرض خاص");
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "active" | "ended">("idle");

  const initiateRoyalCall = async () => {
    if (!phone || !name) return;

    setIsCalling(true);
    setCallStatus("ringing");

    const res = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name, campaign })
    });

    const data = await res.json();

    if (data.success) {
      setCallStatus("active");
      // هنا هيبقى في WebSocket للـ Live Transcript (جاي في الثانية)
    } else {
      setCallStatus("ended");
      setIsCalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gradient-gold mb-4">
            IMPERIUM VOICE™
          </h1>
          <p className="text-2xl text-muted-foreground">
            مركز الاتصال الملكي بالذكاء الاصطناعي
          </p>
          <Badge className="mt-4 text-lg px-6 py-2 bg-green-500/20 text-green-400 border-green-500/30">
            <Activity className="w-5 h-5 ml-2" />
            24/7 نشط – 0 ثواني انتظار
          </Badge>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Call Initiator */}
          <Card className="glass p-10 border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">ابدأ مكالمة ملكية</h2>
                  <p className="text-muted-foreground">الإمبراطور جاهز للإغلاق</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                placeholder="اسم العميل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-lg"
              />
              <Input
                placeholder="رقم الجوال (مثال: 0501234567)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 text-lg"
                dir="ltr"
              />
              <Input
                placeholder="اسم الحملة"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="h-14 text-lg"
              />
              <Button
                size="lg"
                className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90"
                onClick={initiateRoyalCall}
                disabled={isCalling || !phone || !name}
              >
                {isCalling ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    {callStatus === "ringing" ? "جاري الاتصال..." : "المكالمة جارية..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Phone className="w-7 h-7" />
                    ابدأ المكالمة الآن
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Live Status */}
          {callStatus !== "idle" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6"
            >
              <Card className="glass p-10 border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <PhoneIncoming className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">المكالمة الحالية</h3>
                      <p className="text-muted-foreground">الإمبراطور يتكلم الآن</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mic className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {callStatus === "ringing" && "جاري الرنين..."}
                    {callStatus === "active" && "الإمبراطور يتكلم الآن!"}
                    {callStatus === "ended" && "انتهت المكالمة"}
                  </p>
                  <p className="text-muted-foreground">
                    {callStatus === "ringing" && "يرجى الرد على الهاتف..."}
                    {callStatus === "active" && "الإمبراطور يقدم أفضل عرض"}
                    {callStatus === "ended" && "شكراً لانتظارك"}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass p-10">
                <CardHeader>
                  <h3 className="text-xl font-bold text-center">النص الحي للمكالمة</h3>
                </CardHeader>
                <CardContent>
                  <div className="bg-card/50 rounded-2xl p-8 min-h-96 border border-border/50 flex items-center justify-center">
                    <div className="text-center">
                      <Zap className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                      <p className="text-xl text-muted-foreground">
                        السلام عليكم يا {name?.split(" ")[0] || "العميل"}،
                      </p>
                      <p className="text-2xl font-bold text-primary mt-4">
                        معاك الإمبراطور من IMPERIUM GATE
                      </p>
                      <p className="text-lg text-muted-foreground mt-6">
                        عندي لك عرض لا يفوتش في {campaign}،
                      </p>
                      <p className="text-lg text-muted-foreground">
                        تحب أحجز لك زيارة خاصة؟
                      </p>
                      <p className="text-xl font-bold text-primary mt-8">
                        أسعارنا تبدأ من 5 مليون درهم
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}