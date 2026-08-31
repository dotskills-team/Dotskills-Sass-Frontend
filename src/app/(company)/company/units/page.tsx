"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListUnitsQuery } from "@/features/unit/api/unit.api";
import { CreateUnitDialog } from "@/features/unit/components/create-unit-dialog";
import { UnitRowActions } from "@/features/unit/components/unit-actions";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

/** Backend `GET .../units` unpaginated (verified unit.service.ts) — mirrors the company-rbac roles page's hand-rolled Table pattern. */
export default function UnitsPage() {
  const t = useTranslations("units");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: units, isLoading, error, refetch } = useListUnitsQuery(companyId ?? "", {
    skip: !companyId,
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.UNIT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">
          {companyId && <CreateUnitDialog companyId={companyId} units={units ?? []} />}
        </div>

        {!companyId || isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !units || units.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.code")}</TableHead>
                  <TableHead>{t("columns.baseUnit")}</TableHead>
                  <TableHead>{t("columns.conversionFactor")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => {
                  const baseUnit = units.find((candidate) => candidate.id === unit.baseUnitId);
                  return (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium text-foreground">{unit.name}</TableCell>
                      <TableCell className="text-muted-foreground">{unit.code}</TableCell>
                      <TableCell className="text-muted-foreground">{baseUnit ? baseUnit.name : "—"}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{unit.conversionFactor}</TableCell>
                      <TableCell>
                        <StatusBadge status={unit.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <UnitRowActions companyId={companyId} unit={unit} units={units} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </CompanyPermissionGate>
  );
}
