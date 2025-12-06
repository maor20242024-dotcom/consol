import { useTranslations } from "next-intl";

export function PostHistory() {
    const t = useTranslations("Instagram");
    return (
        <div className="p-8 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
            <p>{t("noHistory")}</p>
        </div>
    )
}
