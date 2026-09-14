import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Reset Password — DotSkills",
};

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-semibold text-card-foreground">{t("resetPasswordTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("resetPasswordSubtitle")}</p>
          </div>

          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
