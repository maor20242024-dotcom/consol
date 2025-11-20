"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export interface PageShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  backHref?: string;
  variant?: "default" | "gradient";
  subtitle?: string;
}

export function PageShell({
  title,
  description,
  subtitle,
  actions,
  children,
  className = "",
  showBackButton = false,
  backHref,
  variant = "default"
}: PageShellProps) {
  const router = useRouter();

  return (
    <section className={`page-shell ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => backHref ? router.push(backHref) : router.back()}
                className="h-10 w-10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1">
              {variant === "gradient" ? (
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                  {title}
                </h1>
              ) : (
                <h1 className="section-title">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
              {description && (
                <p className="body-muted mt-1">{description}</p>
              )}
            </div>
          </div>
          {variant === "default" && <div className="divider-glow mt-4" />}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
