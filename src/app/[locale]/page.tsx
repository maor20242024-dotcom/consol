"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

const FloatingDots = dynamic(
  () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
  { ssr: false }
);

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingDots />
      <PageShell title={t("title")} description={t("description")} className="pt-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-panel">
            <p className="body-muted">
              {t("intro")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "automation",
                "ai",
                "crm",
                "analytics",
              ].map((key) => (
                <span key={key} className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t(`features.${key}`)}
                </span>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <Button className="btn-primary">{t("reviewDashboards")}</Button>
              <Button variant="outline" className="btn-outline">{t("openAiAssistant")}</Button>
            </div>
          </div>
          <div className="card-panel space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{t("liveThread")}</p>
              <h3 className="text-2xl font-semibold">{t("channelsArmed")}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["crm", "voice", "automation", "analytics"].map((key) => (
                <div key={key} className="rounded-2xl border border-border-soft px-4 py-3 text-sm text-muted-foreground">
                  {t(`channels.${key}`)}
                </div>
              ))}
            </div>
            <p className="body-muted text-xs">{t("footer")}</p>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
