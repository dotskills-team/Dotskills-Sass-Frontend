"use client";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetPlatformSettingsQuery } from "@/features/platform-settings/api/platform-settings.api";
import { PlatformLogoUpload } from "@/features/platform-settings/components/platform-logo-upload";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";

/**
 * Platform-wide branding — mirrors Company Settings' logo card, just for
 * the one singleton logo shown across the Super Admin / Platform Staff
 * shell (sidebar + navbar), not any individual company's own logo.
 */
export default function PlatformSettingsPage() {
  const { data: settings, isLoading, error, refetch } = useGetPlatformSettingsQuery();

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SETTINGS_READ} fallback={<PermissionDenied />}>
      <PageHeader title="Platform Settings" description="Manage platform-wide branding." />

      <div className="max-w-2xl space-y-6 p-6">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <PlatformLogoUpload logoUrl={settings?.logoUrl ?? null} />
        )}
      </div>
    </PlatformPermissionGate>
  );
}
