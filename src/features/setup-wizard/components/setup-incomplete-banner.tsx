"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";

/**
 * Frontend-only heuristic — Company.status's ONBOARDING/READY values are
 * confirmed dead (nothing in the backend ever sets them, see Frontend
 * Phase 1 plan), so there's no backend "setup complete" flag to key off.
 * Zero Locations is the simplest reliable signal instead. Dismiss is
 * per-render state only (not persisted) — it reflects real state again on
 * the next load, so it can never silently hide a genuinely incomplete
 * setup forever.
 */
export function SetupIncompleteBanner() {
  const t = useTranslations("setupWizard");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;
  const [dismissed, setDismissed] = useState(false);

  const { data: locations, isLoading } = useListLocationsQuery(companyId ?? "", { skip: !companyId });

  if (!companyId || isLoading || dismissed || (locations && locations.length > 0)) {
    return null;
  }

  return (
    <Alert className="mb-6">
      <AlertTitle>{t("bannerTitle")}</AlertTitle>
      <AlertDescription>{t("bannerDescription")}</AlertDescription>
      <div className="mt-3 flex gap-2">
        <Button asChild size="sm">
          <Link href="/company/setup">{t("bannerCta")}</Link>
        </Button>
      </div>
      <AlertAction>
        <Button variant="ghost" size="icon-sm" aria-label={t("bannerDismiss")} onClick={() => setDismissed(true)}>
          <X className="size-4" aria-hidden="true" />
        </Button>
      </AlertAction>
    </Alert>
  );
}
