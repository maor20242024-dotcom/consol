"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, Video, Send, Clock, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface PostDraft {
    caption: string;
    file: File | null;
    previewUrl: string | null;
    scheduledDate: Date | undefined;
}

interface PostCreatorProps {
    draft: PostDraft;
    setDraft: (draft: PostDraft) => void;
}

export function PostCreator({ draft, setDraft }: PostCreatorProps) {
    const t = useTranslations("Instagram");
    const { toast } = useToast();
    // Local state for UI only, data state moved to props
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helpers to update specific fields
    const updateDraft = (updates: Partial<PostDraft>) => {
        setDraft({ ...draft, ...updates });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const url = URL.createObjectURL(selectedFile);
            updateDraft({ file: selectedFile, previewUrl: url });
        }
    };


    const handleSubmit = async (status: 'PUBLISHED' | 'SCHEDULED') => {
        if (!draft.caption && !draft.file) {
            toast({
                title: t("errorTitle"),
                description: t("errorDesc"),
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let mediaUrl = "";
            let mediaType = "IMAGE";

            // 1. Upload File
            if (draft.file) {
                const formData = new FormData();
                formData.append("file", draft.file);
                formData.append("assetType", draft.file.type.startsWith("video") ? "video" : "image");
                formData.append("adId", "posts"); // Generic bucket

                const uploadRes = await fetch("/api/instagram/assets/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Failed to upload media");

                const uploadData = await uploadRes.json();
                mediaUrl = uploadData.url;
                mediaType = draft.file.type.startsWith("video") ? "VIDEO" : "IMAGE";
            }

            // 2. Publish/Schedule Post
            const res = await fetch("/api/instagram/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mediaUrl,
                    caption: draft.caption,
                    mediaType,
                    scheduledAt: status === 'SCHEDULED' ? draft.scheduledDate : null
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create post");

            toast({
                title: status === 'PUBLISHED' ? t("successTitle") : t("scheduledTitle"),
                description: status === 'PUBLISHED'
                    ? t("successDesc")
                    : t("scheduledDesc", { date: format(draft.scheduledDate || new Date(), 'PPP') })
            });

            // Reset form
            updateDraft({
                caption: "",
                file: null,
                previewUrl: null,
                scheduledDate: undefined
            });

        } catch (error: any) {
            console.error(error);
            toast({
                title: t("errorTitle"),
                description: error.message || t("errorDesc"),
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Media Upload */}
            <div className="space-y-2">
                <Label>{t("mediaLabel")}</Label>
                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer hover:bg-muted/50",
                        draft.previewUrl ? "border-primary/50 bg-muted/30" : "border-muted-foreground/30"
                    )}
                    onClick={() => document.getElementById('media-upload')?.click()}
                >
                    {draft.previewUrl ? (
                        <div className="relative aspect-video max-h-[300px] mx-auto overflow-hidden rounded-md">
                            <img src={draft.previewUrl} alt="Preview" className="object-cover w-full h-full" />
                            <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateDraft({ file: null, previewUrl: null });
                                }}
                            >
                                {t("remove")}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <div className="p-4 rounded-full bg-muted">
                                <Upload className="w-8 h-8" />
                            </div>
                            <p className="font-medium">{t("uploadPlaceholder")}</p>
                            <p className="text-xs">{t("uploadSpecs")}</p>
                        </div>
                    )}
                    <input
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="caption">{t("captionLabel")}</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-purple-500">
                        <Sparkles className="w-3 h-3" />
                        {t("aiGenerate")}
                    </Button>
                </div>
                <Textarea
                    id="caption"
                    placeholder={t("captionPlaceholder")}
                    className="min-h-[120px] resize-none"
                    value={draft.caption}
                    onChange={(e) => updateDraft({ caption: e.target.value })}
                    maxLength={2200}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{draft.caption.length} / 2200</span>
                    <span>{30 - (draft.caption.match(/#/g) || []).length} {t("hashtagsRemaining")}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 gap-2">
                            <Clock className="w-4 h-4" />
                            {draft.scheduledDate ? format(draft.scheduledDate, "MMM d, h:mm a") : t("schedule")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={draft.scheduledDate}
                            onSelect={(date) => updateDraft({ scheduledDate: date })}
                            initialFocus
                            disabled={(date) => date < new Date()}
                        />
                        <div className="p-3 border-t">
                            <Input
                                type="time"
                                className="w-full"
                                onChange={(e) => {
                                    if (draft.scheduledDate && e.target.value) {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newDate = new Date(draft.scheduledDate);
                                        newDate.setHours(parseInt(hours), parseInt(minutes));
                                        updateDraft({ scheduledDate: newDate });
                                    }
                                }}
                            />
                        </div>
                    </PopoverContent>
                </Popover>

                <Button
                    className="flex-[2] gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    onClick={() => handleSubmit(draft.scheduledDate ? 'SCHEDULED' : 'PUBLISHED')}
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? (draft.scheduledDate ? t("scheduling") : t("publishing"))
                        : (draft.scheduledDate ? t("schedulePost") : (
                            <>
                                <Send className="w-4 h-4" />
                                {t("publishNow")}
                            </>
                        ))
                    }
                </Button>
            </div>
        </div>
    );
}
