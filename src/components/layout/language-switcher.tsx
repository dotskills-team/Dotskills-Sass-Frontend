"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocaleAction } from "@/i18n/actions";
import { locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSelect(next: Locale) {
    if (next === locale) return;

    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending} aria-label={t("language")}>
          <Languages className="size-4" aria-hidden="true" />
          {locale === "bn" ? t("languageBangla") : t("languageEnglish")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((code) => (
          <DropdownMenuItem key={code} onSelect={() => handleSelect(code)}>
            {code === "bn" ? t("languageBangla") : t("languageEnglish")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
