"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

/** Nav hide হওয়া সত্ত্বেও কেউ সরাসরি URL দিয়ে ঢুকলে (section 13/14) — page content-level defense। */
export function PermissionDenied() {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
      <ShieldAlert className="size-8 text-destructive" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{t("unauthorizedDescription")}</p>
    </div>
  );
}
