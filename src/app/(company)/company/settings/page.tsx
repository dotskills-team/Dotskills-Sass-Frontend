"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import {
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} from "@/features/company-settings/api/company-settings.api";
import { CompanySettingsForm } from "@/features/company-settings/components/company-settings-form";
import {
  toCompanySettingsFormValues,
  toCompanySettingsPayload,
} from "@/features/company-settings/lib/company-settings-form-mapper";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanySettingsFormValues } from "@/features/company-settings/schemas/company-settings.schema";

/** The settings row always exists per-company (verified company-settings.service.ts) — GET+PATCH only, no create/list. */
export default function CompanySettingsPage() {
  const t = useTranslations("settings");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: settings, isLoading, error, refetch } = useGetCompanySettingsQuery(companyId ?? "", {
    skip: !companyId,
  });
  const [updateSettings, { isLoading: isSaving }] = useUpdateCompanySettingsMutation();

  async function handleSubmit(values: CompanySettingsFormValues) {
    if (!companyId) return;
    const result = await updateSettings({ companyId, body: toCompanySettingsPayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("saveSuccess"));
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SETTINGS_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="max-w-2xl p-6">
        {!companyId || isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : settings ? (
          <CompanySettingsForm
            defaultValues={toCompanySettingsFormValues(settings)}
            isSubmitting={isSaving}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </CompanyPermissionGate>
  );
}
