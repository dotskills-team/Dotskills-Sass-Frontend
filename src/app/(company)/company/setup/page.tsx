import type { Metadata } from "next";

import { SetupWizard } from "@/features/setup-wizard/components/setup-wizard";

export const metadata: Metadata = {
  title: "Setup — DotSkills",
};

export default function CompanySetupPage() {
  return <SetupWizard />;
}
