"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListCompanyRolesQuery } from "@/features/company-rbac/api/company-rbac.api";
import { CreateCompanyRoleDialog } from "@/features/company-rbac/components/create-company-role-dialog";
import { CompanyRoleRowActions } from "@/features/company-rbac/components/company-role-actions";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

/** Backend `GET .../rbac/roles` unpaginated (verified) — পুরো list একবারেই আসে, কোনো pagination নেই। */
export default function CompanyRolesPage() {
  const t = useTranslations("companyRbac");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: roles, isLoading, error, refetch } = useListCompanyRolesQuery(companyId ?? "", {
    skip: !companyId,
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.RBAC_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("roles.title")} description={t("roles.description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">{companyId && <CreateCompanyRoleDialog companyId={companyId} />}</div>

        {!companyId || isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !roles || roles.length === 0 ? (
          <EmptyState title={t("roles.empty")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{t("roles.columns.role")}</TableHead>
                  <TableHead>{t("roles.columns.members")}</TableHead>
                  <TableHead>{t("roles.columns.permissions")}</TableHead>
                  <TableHead>{t("roles.columns.type")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role, index) => (
                  <TableRow key={role.id}>
                    <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.code}</p>
                    </TableCell>
                    <TableCell>{role._count.members}</TableCell>
                    <TableCell>{role._count.permissions}</TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge variant="outline">{t("roles.system")}</Badge>
                      ) : (
                        <Badge variant="outline">{t("roles.custom")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <CompanyRoleRowActions companyId={companyId} role={role} />
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
