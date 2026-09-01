"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { Skeleton } from "@/components/ui/skeleton";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useMyOpenSession } from "@/features/cash-drawer/hooks/use-my-open-session";
import { OpenSessionCard } from "@/features/cash-drawer/components/open-session-card";
import { ActiveSessionCard } from "@/features/cash-drawer/components/active-session-card";
import { CloseSessionDialog } from "@/features/cash-drawer/components/close-session-dialog";
import { SessionHistoryTable } from "@/features/cash-drawer/components/session-history-table";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { CashDrawerSession } from "@/types/cash-drawer-session";

export default function CashDrawerPage() {
  const t = useTranslations("cashDrawer");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { session, isLoading, refetch } = useMyOpenSession(companyId);
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const locationName = locations?.find((location) => location.id === session?.locationId)?.name;

  // Captured once when "Close Session" is clicked, deliberately NOT tied
  // to the live `session` above — once the close mutation invalidates
  // the cache and `session` resolves to null, this dialog must stay
  // mounted and showing its result panel until the user explicitly
  // dismisses it, not vanish out from under them.
  const [sessionToClose, setSessionToClose] = useState<CashDrawerSession | null>(null);

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CASH_DRAWER_SESSION_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6 p-6">
        {!companyId || isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : session ? (
          <ActiveSessionCard
            session={session}
            locationName={locationName}
            onCloseClick={() => setSessionToClose(session)}
          />
        ) : (
          <OpenSessionCard companyId={companyId} />
        )}

        {companyId && <SessionHistoryTable companyId={companyId} />}
      </div>

      {companyId && sessionToClose && (
        <CloseSessionDialog
          companyId={companyId}
          session={sessionToClose}
          open={!!sessionToClose}
          onOpenChange={(open) => {
            if (!open) {
              setSessionToClose(null);
              // Explicit, deterministic refresh — never rely solely on
              // background tag-invalidation timing for a transition this
              // visible (Active Session card <-> Open Session form).
              void refetch();
            }
          }}
        />
      )}
    </CompanyPermissionGate>
  );
}
