"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters/date";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListCompanyMembersQuery } from "@/features/company-rbac/api/company-rbac.api";
import { useGetCashDrawerSessionQuery } from "@/features/cash-drawer/api/cash-drawer.api";
import { getSessionStatusToneClass } from "@/features/cash-drawer/lib/session-status-tone";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

/**
 * Cash Drawer Variance notification's redirect target — no dedicated
 * detail page existed before (the History table only lists sessions), and
 * building one small page here reuses the fully-existing backend
 * `GET .../cash-drawer-sessions/:id` endpoint verbatim (its own ownership/
 * location checks already apply — this page shows nothing more than what
 * that call itself is willing to return).
 */
export default function CashDrawerSessionDetailPage() {
  const t = useTranslations("cashDrawer");
  const params = useParams<{ id: string }>();
  const { company, permissions } = useCurrentCompany();
  const companyId = company?.companyId;
  const canReadMembers = permissions.includes(COMPANY_PERMISSIONS.MEMBER_READ);

  const { data: session, isLoading, error, refetch } = useGetCashDrawerSessionQuery(
    { companyId: companyId ?? "", id: params.id },
    { skip: !companyId },
  );
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const { data: members } = useListCompanyMembersQuery(companyId ?? "", {
    skip: !companyId || !canReadMembers,
  });

  const locationName = locations?.find((location) => location.id === session?.locationId)?.name;
  const cashierName = members?.find((member) => member.user.id === session?.cashierId)?.user.fullName;

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CASH_DRAWER_SESSION_READ} fallback={<PermissionDenied />}>
      <PageHeader
        title={t("detail.title")}
        description={t("detail.description")}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/company/cash-drawer">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("detail.back")}
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        {!companyId || isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !session ? null : (
          <Card className="max-w-xl">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{locationName ?? "—"}</CardTitle>
              <Badge variant="outline" className={getSessionStatusToneClass(session.status)}>
                {session.status}
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Field label={t("history.columns.cashier")} value={cashierName ?? "—"} />
              <Field label={t("history.columns.openedAt")} value={formatDateTime(session.shiftStart)} />
              <Field label={t("history.columns.closedAt")} value={formatDateTime(session.shiftEnd)} />
              <Field
                label={t("history.columns.opening")}
                value={Number(session.openingBalance).toLocaleString()}
              />
              <Field
                label={t("history.columns.expected")}
                value={session.expectedClosingBalance != null ? Number(session.expectedClosingBalance).toLocaleString() : "—"}
              />
              <Field
                label={t("history.columns.actual")}
                value={session.actualClosingBalance != null ? Number(session.actualClosingBalance).toLocaleString() : "—"}
              />
              <Field
                label={t("history.columns.variance")}
                value={formatVariance(session.variance)}
                emphasize
              />
              {session.note && <Field label={t("close.note")} value={session.note} />}
            </CardContent>
          </Card>
        )}
      </div>
    </CompanyPermissionGate>
  );
}

function Field({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={emphasize ? "font-medium tabular-nums" : "tabular-nums"}>{value}</p>
    </div>
  );
}

function formatVariance(variance: string | null): string {
  if (variance == null) return "—";
  const value = Number(variance);
  const formatted = Math.abs(value).toLocaleString();
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}
