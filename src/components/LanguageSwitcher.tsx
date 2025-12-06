"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Globe, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("LanguageSwitcher");

  const switchLanguage = (newLocale: string) => {
    startTransition(() => {
      // Replace the locale segment in the pathname
      const segments = pathname.split('/');
      segments[1] = newLocale;
      const newPath = segments.join('/');
      router.push(newPath);
    });
  };

  const languages = [
    { code: "ar", name: "العربية", flag: "🇦🇪", dir: "rtl" },
    { code: "en", name: "English", flag: "🇬🇧", dir: "ltr" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="glass card-hover border border-border/50 hover:border-primary/50 transition-all duration-300 group"
          disabled={isPending}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Globe className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <Crown className="w-3 h-3 absolute -top-1 -right-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-medium text-foreground hidden sm:inline">
              {currentLang.flag} {currentLang.name}
            </span>
            <span className="sm:hidden">{currentLang.flag}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass border-border/50 min-w-[180px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={`flex items-center justify-between cursor-pointer transition-all ${locale === lang.code
                ? "bg-primary/20 text-primary font-bold"
                : "hover:bg-accent/50"
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
            {locale === lang.code && (
              <Crown className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LanguageSwitcher };