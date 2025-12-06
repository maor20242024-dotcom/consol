"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCreator, PostDraft } from "@/components/instagram/post-creator";
import { ScheduledPosts } from "@/components/instagram/scheduled-posts";
import { PostHistory } from "@/components/instagram/post-history";
import { PlusCircle, Calendar, History, Instagram } from "lucide-react";

export default function InstagramContentManagerPage() {
    const t = useTranslations("Instagram");
    const [activeTab, setActiveTab] = useState("create");
    const [draft, setDraft] = useState<PostDraft>({
        caption: "",
        file: null,
        previewUrl: null,
        scheduledDate: undefined
    });

    return (
        <PageShell
            title={t("contentManagerTitle", { defaultMessage: "Content Manager" })}
            description={t("contentManagerDesc", { defaultMessage: "Create, schedule, and manage your Instagram posts." })}
            variant="default" // Using default variant for now
        >
            <div className="space-y-6">
                <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-8">
                        <TabsTrigger value="create" className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            {t("createPost", { defaultMessage: "Create Post" })}
                        </TabsTrigger>
                        <TabsTrigger value="scheduled" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            {t("scheduled", { defaultMessage: "Scheduled" })}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <History className="w-4 h-4" />
                            {t("history", { defaultMessage: "History" })}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Instagram className="w-5 h-5 text-pink-500" />
                                        {t("compose")}
                                    </h2>
                                    <PostCreator draft={draft} setDraft={setDraft} />
                                </div>
                            </div>

                            {/* Preview Section - Could be part of PostCreator, but separated for layout */}
                            <div className="hidden lg:block space-y-4">
                                <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm h-full flex items-center justify-center bg-muted/20">
                                    <div className="text-muted-foreground text-center">
                                        <p>{t("livePreview")}</p>
                                        <p className="text-xs opacity-70">{t("previewHint")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="scheduled">
                        <ScheduledPosts />
                    </TabsContent>

                    <TabsContent value="history">
                        <PostHistory />
                    </TabsContent>
                </Tabs>
            </div>
        </PageShell>
    );
}
