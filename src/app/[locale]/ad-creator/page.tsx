"use client";

import { useTranslations } from "next-intl";
import { PageShell } from "@/components/page-shell";
import dynamic from "next/dynamic";
import { AdCreatorForm } from "@/components/campaigns/ad-creator-form";

const FloatingDots = dynamic(() => import("@/components/FloatingDots").then(m => m.FloatingDots), { ssr: false });

export default function AdCreatorPage() {
    const t = useTranslations("AdCreator");

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/10" />
                <FloatingDots />
            </div>

            <div className="relative h-screen flex flex-col">
                <PageShell
                    title={t("title")}
                    description="Create high-converting ads with AI assistance."
                    variant="gradient"
                >
                    <div className="p-1">
                        <AdCreatorForm />
                    </div>
                </PageShell>
            </div>
        </div>
    );
}
