"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters/currency";
import { normalizeApiError } from "@/lib/api-error";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { useListCompaniesQuery } from "@/features/company/api/company.api";
import { useGetPlanQuery, useListPlansQuery } from "@/features/plan/api/plan.api";
import { useCreateSubscriptionMutation } from "@/features/subscription/api/subscription.api";
import type { BillingCycle } from "@/types/platform";

/**
 * Price eligibility (ACTIVE + company-এর নিজস্ব currency + currently-effective) client-side
 * filter করা হয় শুধু display-এর জন্য — backend `SubscriptionService.create` → `getPrice()`
 * এই একই rule আবার নিজে enforce করে (verified), তাই কোনো নতুন business rule invent হয়নি,
 * শুধু UX-এর জন্য mirror করা হয়েছে (company-side Change Plan-এর মতোই)।
 */
export function CreateSubscriptionDialog() {
  const t = useTranslations("subscriptions");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [planId, setPlanId] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle | null>(null);

  const { data: companies } = useListCompaniesQuery({ limit: 100 });
  const { data: plans } = useListPlansQuery({ status: "ACTIVE", limit: 100 });
  const { data: planDetail, isLoading: isLoadingPlan } = useGetPlanQuery(planId, { skip: !planId });
  const [createSubscription, { isLoading: isSubmitting }] = useCreateSubscriptionMutation();

  const selectedCompany = companies?.items.find((company) => company.id === companyId);

  const now = new Date();
  const eligiblePrices = (planDetail?.prices ?? []).filter(
    (price) =>
      price.isActive &&
      price.currencyCode === selectedCompany?.baseCurrencyCode &&
      new Date(price.effectiveFrom) <= now &&
      (!price.effectiveTo || new Date(price.effectiveTo) > now),
  );

  async function handleSubmit() {
    if (!companyId || !planId || !billingCycle) return;

    const result = await createSubscription({ companyId, planId, billingCycle });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    handleOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCompanyId("");
      setPlanId("");
      setBillingCycle(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SUBSCRIPTION_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">
              {t("form.company")} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={companyId}
              onValueChange={(value) => {
                setCompanyId(value);
                setBillingCycle(null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("form.companyPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {(companies?.items ?? []).map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.tradeName || company.legalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">
              {t("form.plan")} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={planId}
              onValueChange={(value) => {
                setPlanId(value);
                setBillingCycle(null);
              }}
              disabled={!companyId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("form.planPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {(plans?.items ?? []).map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {planId && (
            <div>
              <Label className="mb-2">
                {t("form.billingCycle")} <span className="text-destructive">*</span>
              </Label>
              {isLoadingPlan ? (
                <Skeleton className="h-10 w-full" />
              ) : eligiblePrices.length === 0 ? (
                <EmptyState title={t("form.noEligiblePrices")} />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {eligiblePrices.map((price) => (
                    <button
                      key={price.id}
                      type="button"
                      onClick={() => setBillingCycle(price.billingCycle)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                        billingCycle === price.billingCycle
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:bg-muted/50",
                      )}
                    >
                      {billingCycle === price.billingCycle && <Check className="size-4" aria-hidden="true" />}
                      <span>{price.billingCycle}</span>
                      <span className="font-semibold">{formatCurrency(price.amount, price.currencyCode)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedCompany && (
            <Badge variant="outline" className="text-xs">
              {t("form.currencyNote", { currency: selectedCompany.baseCurrencyCode })}
            </Badge>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!companyId || !planId || !billingCycle || isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tCommon("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
