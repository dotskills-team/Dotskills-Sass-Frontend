"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { dashboardPathForScope, resolveUserScope } from "@/features/auth/lib/scope";

/**
 * Wrong-scope access (section 14) — এখানে redirect হয়, backend থেকে 403
 * পেলেও একই page দেখানো যায়। Session valid থাকলে logout হয় না।
 */
export default function UnauthorizedPage() {
  const t = useTranslations("auth");
  const user = useAppSelector((state) => state.auth.user);

  const ownDashboard = user ? dashboardPathForScope(resolveUserScope(user)) : "/login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <ShieldAlert className="size-12 text-destructive" aria-hidden="true" />
      <h1 className="text-xl font-semibold text-foreground">{t("unauthorizedTitle")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t("unauthorizedDescription")}</p>
      <Button asChild>
        <Link href={ownDashboard}>{user ? t("goToMyDashboard") : t("backToLogin")}</Link>
      </Button>
    </main>
  );
}
