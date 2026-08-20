"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetPlatformRoleQuery } from "@/features/platform-roles/api/platform-role.api";
import { PlatformRolePermissionsEditor } from "@/features/platform-roles/components/platform-role-permissions-editor";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";

/** Plan Details page-এর established pattern reuse (Overview section + embedded editable section)। */
export default function PlatformRoleDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("platformRoles");
  const { data: role, isLoading, error, refetch } = useGetPlatformRoleQuery(params.id);

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.ROLE_READ} fallback={<PermissionDenied />}>
      <PageHeader title={role?.name ?? t("details.overview")} description={role?.code} />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/platform/access-control/roles")}>
          <ArrowLeft aria-hidden="true" />
          {t("details.backToList")}
        </Button>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !role ? (
          <EmptyState title={t("details.notFound")} />
        ) : (
          <>
            <section className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-base font-medium text-foreground">{t("details.overview")}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{role.isSystem ? t("system") : t("custom")}</Badge>
                  <StatusBadge status={role.status} />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">{t("details.code")}</dt>
                  <dd className="font-mono text-foreground">{role.code}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("columns.members")}</dt>
                  <dd className="text-foreground">{role._count.members}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("columns.permissions")}</dt>
                  <dd className="text-foreground">{role._count.permissions}</dd>
                </div>
              </dl>
              {role.description && <p className="mt-3 text-sm text-muted-foreground">{role.description}</p>}
            </section>

            <section className="rounded-lg border border-border p-4">
              <div className="mb-3">
                <h2 className="font-heading text-base font-medium text-foreground">{t("permissions.title")}</h2>
                <p className="text-sm text-muted-foreground">{t("permissions.description", { name: role.name })}</p>
              </div>
              <PlatformRolePermissionsEditor role={role} onSaved={refetch} />
            </section>
          </>
        )}
      </div>
    </PlatformPermissionGate>
  );
}
