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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetCompanyQuery } from "@/features/company/api/company.api";
import { CompanyOwnersSection } from "@/features/company-owner/components/company-owners-section";
import { BootstrapCompanyRbacDialog } from "@/features/company-rbac/components/bootstrap-company-rbac-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";

/**
 * Plan Details page-এর established pattern reuse (Overview section + embedded
 * Owner section, প্রতিটার নিজস্ব RTK tag দিয়ে independently refresh হয়)।
 */
export default function CompanyDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("companies");
  const { data: company, isLoading, error, refetch } = useGetCompanyQuery(params.id);

  const displayName = company ? company.tradeName || company.legalName : undefined;

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_READ} fallback={<PermissionDenied />}>
      <PageHeader title={displayName ?? t("details.overview")} description={company?.code} />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/platform/companies")}>
          <ArrowLeft aria-hidden="true" />
          {t("details.backToList")}
        </Button>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !company ? (
          <EmptyState title={t("details.notFound")} />
        ) : (
          <>
            <section className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-base font-medium text-foreground">{t("details.overview")}</h2>
                <div className="flex items-center gap-2">
                  <BootstrapCompanyRbacDialog companyId={company.id} />
                  <StatusBadge status={company.status} />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">{t("details.code")}</dt>
                  <dd className="font-mono text-foreground">{company.code}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("form.industry")}</dt>
                  <dd className="text-foreground">{company.industry.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("form.email")}</dt>
                  <dd className="text-foreground">{company.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("form.phone")}</dt>
                  <dd className="text-foreground">{company.phone ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("form.taxId")}</dt>
                  <dd className="text-foreground">{company.taxId ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("form.registrationNo")}</dt>
                  <dd className="text-foreground">{company.registrationNo ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("form.baseCurrencyCode")}</dt>
                  <dd className="text-foreground">{company.baseCurrencyCode}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("form.timezone")}</dt>
                  <dd className="text-foreground">{company.timezone}</dd>
                </div>
              </dl>
            </section>

            <CompanyOwnersSection companyId={company.id} />
          </>
        )}
      </div>
    </PlatformPermissionGate>
  );
}
