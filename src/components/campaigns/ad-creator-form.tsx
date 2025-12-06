"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Image as ImageIcon, Loader2 } from "lucide-react";
import { generateAd } from "@/actions/ad-creator";
import { useToast } from "@/hooks/use-toast";

export function AdCreatorForm() {
    const t = useTranslations("AdCreator");
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState("");
    const [tone, setTone] = useState("Professional");
    const [adData, setAdData] = useState({
        headline: "",
        primaryText: "",
        hashtags: [] as string[]
    });

    const handleGenerate = async () => {
        if (!topic) {
            toast({
                title: "Topic Required",
                description: "Please enter a topic for the ad.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        const result = await generateAd(topic, tone, "Instagram");
        setLoading(false);

        if (result.success && result.data) {
            setAdData(result.data);
            toast({
                title: "Ad Generated",
                description: "AI has created your ad copy.",
            });
        } else {
            toast({
                title: "Generation Failed",
                description: "Could not generate ad copy.",
                variant: "destructive"
            });
        }
    };

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="glass border-border/50">
                <CardHeader>
                    <CardTitle>{t("createNewCampaign")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Ad Topic / Property Name</Label>
                        <Input
                            placeholder="e.g. Luxury Villa in Palm Jumeirah"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tone</Label>
                        <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Professional">Professional</SelectItem>
                                <SelectItem value="Luxury">Luxury</SelectItem>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                                <SelectItem value="Friendly">Friendly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                            <><Wand2 className="w-4 h-4 mr-2" /> Generate with AI</>
                        )}
                    </Button>

                    <div className="border-t border-border/50 pt-6">
                        <Label className="mb-2 block">{t("upload")}</Label>
                        <div
                            className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('ad-media-upload')?.click()}
                        >
                            {previewUrl ? (
                                <div className="space-y-2">
                                    {file?.type.startsWith('video') ? (
                                        <video src={previewUrl} className="max-h-32 mx-auto rounded" />
                                    ) : (
                                        <img src={previewUrl} className="max-h-32 mx-auto rounded" alt="Preview" />
                                    )}
                                    <p className="text-xs text-muted-foreground">Click to replace</p>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">{t("dragAndDrop")}</p>
                                </>
                            )}
                        </div>
                        <input
                            id="ad-media-upload"
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="glass border-border/50 bg-black/5">
                <CardHeader>
                    <CardTitle>{t("preview")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Instagram Preview Mockup */}
                    <div className="bg-white text-black rounded-xl overflow-hidden shadow-2xl max-w-sm mx-auto">
                        {/* Header */}
                        <div className="p-3 flex items-center gap-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-gray-200" />
                            <div>
                                <p className="text-xs font-bold">Imperium Gate</p>
                                <p className="text-[10px] text-gray-500">Sponsored</p>
                            </div>
                        </div>

                        {/* Image Placeholder or Preview */}
                        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                            {previewUrl ? (
                                file?.type.startsWith('video') ? (
                                    <video src={previewUrl} className="w-full h-full object-cover" controls />
                                ) : (
                                    <img src={previewUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                                )
                            ) : (
                                <ImageIcon className="w-12 h-12 text-gray-300" />
                            )}
                        </div>

                        {/* Action Bar */}
                        <div className="p-3 bg-blue-50 flex justify-between items-center">
                            <span className="text-xs font-semibold text-blue-900">Learn More</span>
                            <span className="text-xs text-blue-900">&gt;</span>
                        </div>

                        {/* Content */}
                        <div className="p-3 space-y-1">
                            <p className="text-sm font-semibold">{adData.headline || "Your Headline Here"}</p>
                            <p className="text-xs text-gray-700 line-clamp-3">
                                {adData.primaryText || "Your ad description will appear here..."}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {adData.hashtags.map((tag, i) => (
                                    <span key={i} className="text-[10px] text-blue-600">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
