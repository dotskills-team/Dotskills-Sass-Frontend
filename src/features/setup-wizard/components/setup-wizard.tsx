"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery, useCreateLocationMutation } from "@/features/location/api/location.api";
import { LocationForm } from "@/features/location/components/location-form";
import { toLocationPayload } from "@/features/location/lib/location-form-mapper";
import type { LocationFormValues } from "@/features/location/schemas/location.schema";

import {
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} from "@/features/company-settings/api/company-settings.api";
import { CompanySettingsForm } from "@/features/company-settings/components/company-settings-form";
import {
  toCompanySettingsFormValues,
  toCompanySettingsPayload,
} from "@/features/company-settings/lib/company-settings-form-mapper";
import type { CompanySettingsFormValues } from "@/features/company-settings/schemas/company-settings.schema";

import { useListUnitsQuery } from "@/features/unit/api/unit.api";
import { useListCategoriesQuery } from "@/features/category/api/category.api";
import { CreateUnitDialog } from "@/features/unit/components/create-unit-dialog";
import { CreateProductDialog } from "@/features/product/components/create-product-dialog";
import { BulkImportDialog } from "@/features/bulk-import/components/bulk-import-dialog";
import { normalizeApiError } from "@/lib/api-error";

const TOTAL_STEPS = 3;

/**
 * A brand-new, standalone flow (`/company/setup`) — not gated behind
 * `Company.status` (confirmed dead: ONBOARDING/READY are never actually
 * set anywhere in the backend). Every step reuses an already-built,
 * already-tested form/dialog rather than duplicating logic — this is
 * pure orchestration over existing Location/Settings/Product/Bulk-Import
 * pieces, matching the design doc's own framing ("কোনো নতুন backend
 * feature না... শুধু একটা যৌক্তিক গাইডেড ক্রমে সাজানো").
 */
export function SetupWizard() {
  const t = useTranslations("setupWizard");
  const router = useRouter();
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;
  const [step, setStep] = useState(1);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <p className="mb-2 text-sm font-medium text-muted-foreground">{t("stepOf", { step, total: TOTAL_STEPS })}</p>

      {!companyId ? (
        <Skeleton className="h-96 w-full" />
      ) : step === 1 ? (
        <LocationStep companyId={companyId} onNext={() => setStep(2)} />
      ) : step === 2 ? (
        <SettingsStep companyId={companyId} onNext={() => setStep(3)} onBack={() => setStep(1)} />
      ) : (
        <ProductsStep companyId={companyId} onFinish={() => router.push("/company/dashboard")} onBack={() => setStep(2)} />
      )}
    </div>
  );
}

function LocationStep({ companyId, onNext }: { companyId: string; onNext: () => void }) {
  const t = useTranslations("setupWizard");
  const { data: locations, isLoading } = useListLocationsQuery(companyId);
  const [createLocation, { isLoading: isSubmitting }] = useCreateLocationMutation();

  async function handleSubmit(values: LocationFormValues) {
    const result = await createLocation({ companyId, body: toLocationPayload(values) });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    onNext();
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  if (locations && locations.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("step1.alreadyHaveTitle", { count: locations.length })}</CardTitle>
          <CardDescription>{t("step1.alreadyHaveDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onNext}>{t("next")}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("step1.title")}</CardTitle>
        <CardDescription>{t("step1.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LocationForm
          defaultValues={{ name: "", locationType: "BRANCH", address: "", isSalesEnabled: true }}
          isTypeEditable
          isSubmitting={isSubmitting}
          submitLabel={t("next")}
          cancelLabel={t("skip")}
          onCancel={onNext}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
}

function SettingsStep({ companyId, onNext, onBack }: { companyId: string; onNext: () => void; onBack: () => void }) {
  const t = useTranslations("setupWizard");
  const { data: settings, isLoading } = useGetCompanySettingsQuery(companyId);
  const [updateSettings, { isLoading: isSubmitting }] = useUpdateCompanySettingsMutation();

  async function handleSubmit(values: CompanySettingsFormValues) {
    const result = await updateSettings({ companyId, body: toCompanySettingsPayload(values) });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    onNext();
  }

  if (isLoading || !settings) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>{t("step2.title")}</CardTitle>
          <CardDescription>{t("step2.description")}</CardDescription>
        </CardHeader>
      </Card>
      <CompanySettingsForm defaultValues={toCompanySettingsFormValues(settings)} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          {t("back")}
        </Button>
        <Button type="button" variant="outline" onClick={onNext}>
          {t("skip")}
        </Button>
      </div>
    </div>
  );
}

function ProductsStep({ companyId, onFinish, onBack }: { companyId: string; onFinish: () => void; onBack: () => void }) {
  const t = useTranslations("setupWizard");
  const { data: units } = useListUnitsQuery(companyId);
  const { data: categories } = useListCategoriesQuery(companyId);
  const hasUnits = (units?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("step3.title")}</CardTitle>
          <CardDescription>{t("step3.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasUnits ? (
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium">{t("step3.needUnitTitle")}</p>
              <p className="mb-3 text-sm text-muted-foreground">{t("step3.needUnitDescription")}</p>
              <CreateUnitDialog companyId={companyId} units={units ?? []} />
            </div>
          ) : (
            <>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                {t("step3.haveUnitsNotice", { count: units?.length ?? 0 })}
              </p>
              <div className="flex flex-wrap gap-2">
                <BulkImportDialog companyId={companyId} />
                <CreateProductDialog companyId={companyId} categories={categories ?? []} units={units ?? []} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          {t("back")}
        </Button>
        <Button type="button" onClick={onFinish}>
          {t("finish")}
        </Button>
      </div>
    </div>
  );
}
