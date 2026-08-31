"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { CreateLocationDialog } from "@/features/location/components/create-location-dialog";
import { LocationRowActions } from "@/features/location/components/location-actions";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function LocationsPage() {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: locations, isLoading, error, refetch } = useListLocationsQuery(companyId ?? "", {
    skip: !companyId,
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.LOCATION_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">{companyId && <CreateLocationDialog companyId={companyId} />}</div>

        {!companyId || isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !locations || locations.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.type")}</TableHead>
                  <TableHead>{t("columns.address")}</TableHead>
                  <TableHead>{t("columns.salesEnabled")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium text-foreground">{location.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(`type.${location.locationType}`)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{location.address ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {location.isSalesEnabled ? tCommon("yes") : tCommon("no")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={location.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <LocationRowActions companyId={companyId} location={location} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </CompanyPermissionGate>
  );
}
