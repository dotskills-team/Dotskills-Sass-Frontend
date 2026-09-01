"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { formatDateTime } from "@/lib/formatters/date";

import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { CashDrawerSession } from "@/types/cash-drawer-session";

/**
 * Purely presentational — no longer owns the CloseSessionDialog itself
 * (see the page-level fix: a dialog nested inside a card that only
 * renders while `session` is truthy would get forcibly unmounted mid-
 * display the instant the close mutation's cache invalidation resolves
 * `session` to null, yanking the result panel out from under the user
 * before they could read it or dismiss it themselves).
 */
export function ActiveSessionCard({
  session,
  locationName,
  onCloseClick,
}: {
  session: CashDrawerSession;
  locationName: string | undefined;
  onCloseClick: () => void;
}) {
  const t = useTranslations("cashDrawer");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("active.title")}</CardTitle>
        <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CASH_DRAWER_SESSION_CLOSE}>
          <Button onClick={onCloseClick}>{t("active.closeAction")}</Button>
        </CompanyPermissionGate>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">{t("open.location")}</dt>
            <dd className="text-foreground">{locationName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("active.openedAt")}</dt>
            <dd className="text-foreground">{formatDateTime(session.shiftStart)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("open.openingBalance")}</dt>
            <dd className="tabular-nums text-foreground">{Number(session.openingBalance).toLocaleString()}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
