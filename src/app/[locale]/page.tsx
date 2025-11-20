"use client";

import dynamic from "next/dynamic";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

const FloatingDots = dynamic(
  () => import("@/components/FloatingDots").then((m) => m.FloatingDots),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingDots />
      <PageShell title="Imperium Gate" description="Command the luxury real estate pulse from one unified canvas." className="pt-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-panel">
            <p className="body-muted">
              The control room you just stepped into now relies on a single intelligent system that
              surfaces insights, campaigns, and operations with cinematic clarity.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Strategy-first automation",
                "AI-driven campaigns",
                "Premium CRM insights",
                "Immersive analytics",
              ].map((item) => (
                <span key={item} className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <Button className="btn-primary">Review dashboards</Button>
              <Button variant="outline" className="btn-outline">Open AI assistant</Button>
            </div>
          </div>
          <div className="card-panel space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Live thread</p>
              <h3 className="text-2xl font-semibold">Channels armed</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["CRM", "Voice", "Automation", "Analytics"].map((name) => (
                <div key={name} className="rounded-2xl border border-border-soft px-4 py-3 text-sm text-muted-foreground">
                  {name}
                </div>
              ))}
            </div>
            <p className="body-muted text-xs">Every area already uses the refreshed UI. Choose from the sidebar to explore.</p>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
