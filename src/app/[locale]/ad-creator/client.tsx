"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
    Upload,
    Type,
    Sparkles,
    Send,
    ArrowLeft,
    Video,
    Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
    generateHelineSuggestion,
    generateDescriptionSuggestion,
    simulateApiDelay,
} from "@/lib/ai-suggestions";

const FloatingDots = dynamic(
    () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
    { ssr: false }
);

export function AdCreatorContent() {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const locale = pathname.split("/")[1] || "en";
    const campaignId = searchParams.get("campaignId");

    const [activeTab, setActiveTab] = useState("content");
    const [adData, setAdData] = useState({
        headline: "",
        description: "",
        callToAction: "SHOP_NOW",
    });
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState<"headline" | "description" | null>(null);
    const [uploadedAssets, setUploadedAssets] = useState<any[]>([]);

    const handleAISuggestHeadline = async () => {
        setAiLoading("headline");
        try {
            await simulateApiDelay(800);
            const suggestion = generateHelineSuggestion(
                adData.headline || "Your Product",
                "20"
            );
            setAdData((prev) => ({
                ...prev,
                headline: suggestion,
            }));
            toast({
                title: "AI Suggestion",
                description: "Headline generated successfully!",
                variant: "default",
            });
        } catch (error) {
            console.error("AI suggestion error:", error);
            toast({
                title: "Error",
                description: "Failed to generate headline suggestion",
                variant: "destructive",
            });
        } finally {
            setAiLoading(null);
        }
    };

    const handleAISuggestDescription = async () => {
        setAiLoading("description");
        try {
            await simulateApiDelay(800);
            const suggestion = generateDescriptionSuggestion(
                adData.headline || "Your Product",
                "Products",
                "20"
            );
            setAdData((prev) => ({
                ...prev,
                description: suggestion,
            }));
            toast({
                title: "AI Suggestion",
                description: "Description generated successfully!",
                variant: "default",
            });
        } catch (error) {
            console.error("AI suggestion error:", error);
            toast({
                title: "Error",
                description: "Failed to generate description suggestion",
                variant: "destructive",
            });
        } finally {
            setAiLoading(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("adId", campaignId || "temp");
                formData.append("assetType", file.type.startsWith("video") ? "video" : "image");

                try {
                    const response = await fetch("/api/instagram/assets/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (response.ok) {
                        const asset = await response.json();
                        setUploadedAssets((prev) => [...prev, asset]);
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    console.error("Upload error for file:", file.name, error);
                    errorCount++;
                }
            }

            // Show summary toast
            if (successCount > 0 && errorCount === 0) {
                toast({
                    title: "Success",
                    description: `${successCount} file(s) uploaded successfully`,
                    variant: "default",
                });
            } else if (successCount > 0 && errorCount > 0) {
                toast({
                    title: "Partial Success",
                    description: `${successCount} file(s) uploaded, ${errorCount} failed`,
                    variant: "default",
                });
            } else if (errorCount > 0) {
                toast({
                    title: "Upload Failed",
                    description: `Failed to upload ${errorCount} file(s)`,
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAd = async () => {
        // Validation
        if (!adData.headline) {
            toast({
                title: t("validation"),
                description: t("headline") + " " + t("validation.required"),
                variant: "destructive",
            });
            return;
        }

        if (!adData.description) {
            toast({
                title: t("validation"),
                description: t("description") + " " + t("validation.required"),
                variant: "destructive",
            });
            return;
        }

        if (uploadedAssets.length === 0) {
            toast({
                title: t("validation"),
                description: "Please upload at least one image or video",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/instagram/ads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignId: campaignId || "",
                    headline: adData.headline,
                    description: adData.description,
                    callToAction: adData.callToAction,
                    adType: uploadedAssets.some((a) => a.type === "video") ? "video" : "image",
                    status: "draft",
                    impressions: 0,
                    clicks: 0,
                    conversions: 0,
                    spend: "0",
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Ad created successfully!",
                    variant: "default",
                });
                setTimeout(() => {
                    router.push(`/${locale}/campaigns-manager`);
                }, 1500);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to create ad. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Create error:", error);
            toast({
                title: "Error",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
            <FloatingDots />
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                            {t("adCreator")}
                        </h1>
                        <p className="text-gray-400">{t("createNewCampaign")}</p>
                    </div>
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="border-purple-500 hover:bg-purple-500/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t("cancel")}
                    </Button>
                </div>

                <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-slate-700/50 mb-6">
                                <TabsTrigger value="content" className="flex items-center">
                                    <Type className="w-4 h-4 mr-2" />
                                    {t("newCampaign")}
                                </TabsTrigger>
                                <TabsTrigger value="media" className="flex items-center">
                                    <Upload className="w-4 h-4 mr-2" />
                                    {t("upload")}
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="flex items-center">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    {t("preview")}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="content">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-300">
                                                {t("headline")}
                                            </label>
                                            <Button
                                                onClick={handleAISuggestHeadline}
                                                disabled={aiLoading === "headline" || aiLoading === "description"}
                                                size="sm"
                                                variant="outline"
                                                className="border-purple-500/50 hover:bg-purple-500/10 h-8"
                                            >
                                                {aiLoading === "headline" ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                        AI Suggestion
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <Input
                                            placeholder="Enter headline (max 125 chars)"
                                            value={adData.headline}
                                            onChange={(e) =>
                                                setAdData({
                                                    ...adData,
                                                    headline: e.target.value.slice(0, 125),
                                                })
                                            }
                                            className="bg-slate-700/50 border-slate-600 text-white"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            {adData.headline.length}/125
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-300">
                                                {t("description")}
                                            </label>
                                            <Button
                                                onClick={handleAISuggestDescription}
                                                disabled={aiLoading === "description" || aiLoading === "headline"}
                                                size="sm"
                                                variant="outline"
                                                className="border-purple-500/50 hover:bg-purple-500/10 h-8"
                                            >
                                                {aiLoading === "description" ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                        AI Suggestion
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <Textarea
                                            placeholder="Enter description (max 300 chars)"
                                            value={adData.description}
                                            onChange={(e) =>
                                                setAdData({
                                                    ...adData,
                                                    description: e.target.value.slice(0, 300),
                                                })
                                            }
                                            className="bg-slate-700/50 border-slate-600 text-white min-h-32"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            {adData.description.length}/300
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-300 block mb-2">
                                            {t("cta")}
                                        </label>
                                        <select
                                            value={adData.callToAction}
                                            onChange={(e) =>
                                                setAdData({
                                                    ...adData,
                                                    callToAction: e.target.value,
                                                })
                                            }
                                            className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md p-2"
                                        >
                                            <option value="SHOP_NOW">Shop Now</option>
                                            <option value="LEARN_MORE">Learn More</option>
                                            <option value="BOOK_NOW">Book Now</option>
                                        </select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="media">
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/50 transition cursor-pointer">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Upload className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                                            <p className="text-gray-400">
                                                {t("dragAndDrop")}
                                            </p>
                                        </label>
                                    </div>

                                    {uploadedAssets.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-gray-300">
                                                {t("uploaded")}
                                            </h3>
                                            {uploadedAssets.map((asset, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between bg-slate-700/30 p-3 rounded"
                                                >
                                                    <div className="flex items-center">
                                                        {asset.type === "video" ? (
                                                            <Video className="w-4 h-4 text-purple-400 mr-2" />
                                                        ) : (
                                                            <Upload className="w-4 h-4 text-purple-400 mr-2" />
                                                        )}
                                                        <span className="text-sm text-gray-300">
                                                            {asset.filename}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline">
                                                        {asset.type}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="preview">
                                <div className="bg-gradient-to-b from-slate-700/30 to-slate-900/30 rounded-lg p-6 border border-slate-700">
                                    <div className="max-w-sm mx-auto">
                                        <div className="bg-gradient-to-b from-slate-600 to-slate-800 rounded-lg p-4 text-center">
                                            {uploadedAssets.length > 0 ? (
                                                <div className="bg-slate-700 rounded h-48 flex items-center justify-center mb-4">
                                                    <span className="text-gray-500">
                                                        {t("mediaPreview")}
                                                    </span>
                                                </div>
                                            ) : null}

                                            <h2 className="text-lg font-bold text-white mb-2">
                                                {adData.headline || "Your Headline Here"}
                                            </h2>
                                            <p className="text-sm text-gray-300 mb-4">
                                                {adData.description || "Your description here"}
                                            </p>
                                            <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                                {adData.callToAction.replace("_", " ")}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-between mt-8">
                            <Button
                                onClick={() => setActiveTab("media")}
                                variant="outline"
                                disabled={activeTab === "content"}
                                className="border-purple-500/20"
                            >
                                {t("previous")}
                            </Button>
                            {activeTab === "preview" ? (
                                <Button
                                    onClick={handleCreateAd}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {loading ? t("creating") : t("create")}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setActiveTab("preview")}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    {t("preview")}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
