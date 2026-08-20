"use client";

import { useTranslations } from "next-intl";

import { useAppSelector } from "@/store/hooks";

export function UserGreeting() {
  const t = useTranslations("auth");
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return <p className="text-muted-foreground">{t("welcomeBack", { name: user.fullName })}</p>;
}
