"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { useListPlatformPermissionsQuery } from "@/features/platform-roles/api/platform-role.api";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";

/**
 * Read-only catalog browse — permission শুধু code-এ hardcoded `@RequirePlatformPermissions(...)`
 * decorator দিয়ে enforce হয় (dynamic lookup নয়), তাই এখানে কোনো create/edit/delete নেই —
 * শুধু existing catalog দেখার জন্য (Role Details page-এই permission assign করা হয়)।
 */
export default function PlatformPermissionsPage() {
  const t = useTranslations("platformRoles");
  const { data: permissions, isLoading, error, refetch } = useListPlatformPermissionsQuery();

  const grouped = new Map<string, typeof permissions>();
  for (const permission of permissions ?? []) {
    const list = grouped.get(permission.moduleCode) ?? [];
    list.push(permission);
    grouped.set(permission.moduleCode, list);
  }

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.ROLE_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("permissionsPage.title")} description={t("permissionsPage.description")} />

      <div className="p-6">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !permissions || permissions.length === 0 ? (
          <EmptyState title={t("permissionsPage.empty")} />
        ) : (
          <div className="space-y-6">
            {[...grouped.entries()].map(([moduleCode, items]) => (
              <section key={moduleCode} className="rounded-lg border border-border p-4">
                <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {moduleCode}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items?.map((permission) => (
                    <div key={permission.code} className="rounded-md border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{permission.name}</p>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {permission.action}
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{permission.code}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PlatformPermissionGate>
  );
}
