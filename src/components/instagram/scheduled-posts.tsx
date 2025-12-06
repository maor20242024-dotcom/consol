import { useTranslations } from "next-intl";

export function ScheduledPosts() {
    const t = useTranslations("Instagram");
    return (
        <div className="p-8 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
            <p>{t("noScheduled")}</p>
        </div>
    )
}
