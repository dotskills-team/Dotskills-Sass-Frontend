import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export const metadata: Metadata = {
  title: "Forgot Password — DotSkills",
};

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-semibold text-card-foreground">{t("forgotPasswordTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("forgotPasswordSubtitle")}</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
