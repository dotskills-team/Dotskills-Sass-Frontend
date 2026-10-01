import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Platform log in — DotSkills",
};

export default async function PlatformLoginPage() {
  const t = await getTranslations("auth");

  return (
    <AuthShell variant="platform" title={t("loginTitle")} subtitle={t("loginSubtitle")}>
      <Suspense>
        <LoginForm scope="platform" />
      </Suspense>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------
   Home page (src/app/page.tsx) — replace the whole file with:

   import LoginPage from "./login/page";

   export default LoginPage;
   ------------------------------------------------------------------ */
