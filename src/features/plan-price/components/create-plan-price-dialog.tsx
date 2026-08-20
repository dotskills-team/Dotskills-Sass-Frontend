"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { PlanPriceForm } from "@/features/plan-price/components/plan-price-form";
import { useCreatePlanPriceMutation } from "@/features/plan-price/api/plan-price.api";
import { toCreatePlanPricePayload } from "@/features/plan-price/lib/plan-price-form-mapper";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { PlanPriceCreateFormValues } from "@/features/plan-price/schemas/plan-price.schema";

const EMPTY_VALUES: PlanPriceCreateFormValues = {
  billingCycle: "MONTHLY",
  currencyCode: "",
  amount: "",
  effectiveFrom: "",
  effectiveTo: "",
  isActive: "true",
};

export function CreatePlanPriceDialog({ planId }: { planId: string }) {
  const t = useTranslations("planPrices");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createPlanPrice, { isLoading }] = useCreatePlanPriceMutation();

  async function handleSubmit(values: PlanPriceCreateFormValues) {
    const result = await createPlanPrice({ planId, ...toCreatePlanPricePayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_PRICING_CREATE}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <PlanPriceForm
          mode="create"
          defaultValues={EMPTY_VALUES}
          isSubmitting={isLoading}
          submitLabel={tCommon("create")}
          cancelLabel={tCommon("cancel")}
          onCancel={() => setOpen(false)}
          onSubmit={(values) => handleSubmit(values as PlanPriceCreateFormValues)}
        />
      </DialogContent>
    </Dialog>
  );
}
