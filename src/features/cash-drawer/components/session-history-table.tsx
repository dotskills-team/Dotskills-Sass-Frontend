"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { useAssignedLocations } from "@/features/location/hooks/use-assigned-locations";
import { useListCompanyMembersQuery } from "@/features/company-rbac/api/company-rbac.api";
import { useListCashDrawerSessionsQuery } from "@/features/cash-drawer/api/cash-drawer.api";
import { buildCashDrawerSessionsColumns } from "@/features/cash-drawer/components/cash-drawer-sessions-columns";
import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

const ALL_LOCATIONS = "__all__";

export function SessionHistoryTable({ companyId }: { companyId: string }) {
  const t = useTranslations("cashDrawer");
  const { permissions } = useCurrentCompany();
  const canReadMembers = permissions.includes(COMPANY_PERMISSIONS.MEMBER_READ);

  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState(ALL_LOCATIONS);

  const { data, isLoading, isFetching, error, refetch } = useListCashDrawerSessionsQuery(
    { companyId, page, locationId: locationId === ALL_LOCATIONS ? undefined : locationId },
    { skip: !companyId },
  );
  const { locations } = useAssignedLocations(companyId);
  // Cashier names are a display nicety, not core functionality — a role
  // without MEMBER_READ still sees the full history, just with the raw
  // cashierId column falling back to "—" instead of a name.
  const { data: members } = useListCompanyMembersQuery(companyId, { skip: !companyId || !canReadMembers });

  const columns = buildCashDrawerSessionsColumns(locations, members ?? [], {
    location: t("history.columns.location"),
    cashier: t("history.columns.cashier"),
    openedAt: t("history.columns.openedAt"),
    closedAt: t("history.columns.closedAt"),
    opening: t("history.columns.opening"),
    expected: t("history.columns.expected"),
    actual: t("history.columns.actual"),
    variance: t("history.columns.variance"),
    status: t("history.columns.status"),
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("history.title")}</CardTitle>
        <Select
          value={locationId}
          onValueChange={(value) => {
            setLocationId(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t("history.locationFilterPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_LOCATIONS}>{t("history.allLocations")}</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading || isFetching}
          error={error}
          onRetry={refetch}
          pagination={data?.meta ?? undefined}
        />

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="px-6 pb-4">
            <DataTablePagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              onPageChange={setPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
