"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Wallet } from "lucide-react";

import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useMyOpenSession } from "@/features/cash-drawer/hooks/use-my-open-session";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

/**
 * Slots into the company layout's header button cluster
 * (`src/app/(company)/layout.tsx`), before the LanguageSwitcher — the
 * only persistent-status-indicator anywhere in this codebase (no prior
 * badge/notification convention existed to match, confirmed by exhaustive
 * search). Renders nothing when the logged-in user has no open session,
 * or lacks CASH_DRAWER_SESSION_READ — no empty-state clutter in a global bar.
 */
export function CashDrawerStatusIndicator({ companyId }: { companyId: string | undefined }) {
  const t = useTranslations("cashDrawer");
  const { session } = useMyOpenSession(companyId);
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId || !session });

  if (!session) return null;

  const locationName = locations?.find((location) => location.id === session.locationId)?.name;

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CASH_DRAWER_SESSION_READ}>
      <Link
        href="/company/cash-drawer"
        className="flex items-center gap-1.5 rounded-full border border-info/30 bg-info/15 px-3 py-1 text-xs font-medium text-info transition-colors hover:bg-info/25"
      >
        <Wallet className="size-3.5" aria-hidden="true" />
        {t("indicator.label", {
          location: locationName ?? "—",
          time: format(new Date(session.shiftStart), "h:mm a"),
        })}
      </Link>
    </CompanyPermissionGate>
  );
}
