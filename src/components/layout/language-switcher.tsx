"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocaleAction } from "@/i18n/actions";
import { locales, type Locale } from "@/i18n/config";

const LOCALE_FLAG: Record<Locale, string> = {
  en: "/flags/flag.png",
  bn: "/flags/bangladesh.png",
};

const LOCALE_SHORT_LABEL: Record<Locale, string> = {
  en: "EN",
  bn: "বাং",
};

function LocaleFlag({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <Image
      src={LOCALE_FLAG[locale]}
      alt=""
      aria-hidden="true"
      width={18}
      height={13}
      unoptimized
      className={className ?? "h-[13px] w-[18px] rounded-[2px] object-cover"}
    />
  );
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
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
          <LocaleFlag locale={locale} />
          {LOCALE_SHORT_LABEL[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((code) => (
          <DropdownMenuItem key={code} onSelect={() => handleSelect(code)}>
            <LocaleFlag locale={code} />
            {code === "bn" ? t("languageBangla") : t("languageEnglish")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
