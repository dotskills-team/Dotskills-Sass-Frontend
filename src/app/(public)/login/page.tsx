import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Log in — DotSkills",
};

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <AuthShell variant="company" title={t("loginTitle")} subtitle={t("loginSubtitle")}>
      <Suspense>
        <LoginForm scope="company" />
      </Suspense>
    </AuthShell>
  );
}
