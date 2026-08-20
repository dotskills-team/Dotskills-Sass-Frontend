import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/features/auth/components/login-form";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export const metadata: Metadata = {
  title: "Log in — DotSkills",
};

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-semibold text-card-foreground">{t("loginTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("loginSubtitle")}</p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
