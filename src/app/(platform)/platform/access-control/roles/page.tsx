"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useListPlatformRolesQuery } from "@/features/platform-roles/api/platform-role.api";
import { CreatePlatformRoleDialog } from "@/features/platform-roles/components/create-platform-role-dialog";
import { PlatformRoleRowActions } from "@/features/platform-roles/components/platform-role-actions";
import { SyncPermissionCatalogButton } from "@/features/platform-roles/components/sync-permission-catalog-button";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";

/** Backend `GET /platform/roles` unpaginated (verified) — Company Roles-এর মতোই পুরো list একবারে আসে। */
export default function PlatformRolesPage() {
  const t = useTranslations("platformRoles");
  const { data: roles, isLoading, error, refetch } = useListPlatformRolesQuery();

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.ROLE_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex items-center justify-end gap-2">
          <SyncPermissionCatalogButton />
          <CreatePlatformRoleDialog />
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !roles || roles.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{t("columns.role")}</TableHead>
                  <TableHead>{t("columns.members")}</TableHead>
                  <TableHead>{t("columns.permissions")}</TableHead>
                  <TableHead>{t("columns.type")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role, index) => (
                  <TableRow key={role.id}>
                    <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                    <TableCell>
                      <Link href={`/platform/access-control/roles/${role.id}`} className="block hover:underline">
                        <p className="font-medium text-foreground">{role.name}</p>
                        <p className="text-xs text-muted-foreground">{role.code}</p>
                      </Link>
                    </TableCell>
                    <TableCell>{role._count.members}</TableCell>
                    <TableCell>{role._count.permissions}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.isSystem ? t("system") : t("custom")}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={role.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <PlatformRoleRowActions role={role} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PlatformPermissionGate>
  );
}
