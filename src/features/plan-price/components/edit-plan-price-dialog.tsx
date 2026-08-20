"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlanPriceForm } from "@/features/plan-price/components/plan-price-form";
import { useUpdatePlanPriceMutation } from "@/features/plan-price/api/plan-price.api";
import { toUpdatePlanPricePayload } from "@/features/plan-price/lib/plan-price-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { PlanPriceEditFormValues } from "@/features/plan-price/schemas/plan-price.schema";
import type { PlanPrice } from "@/types/platform";

interface EditPlanPriceDialogProps {
  planId: string;
  price: PlanPrice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** `billingCycle`/`currencyCode` backend-এ immutable (UpdatePlanPriceDto-তে নেই) — তাই edit form সেগুলো দেখায় না। */
export function EditPlanPriceDialog({ planId, price, open, onOpenChange }: EditPlanPriceDialogProps) {
  const t = useTranslations("planPrices");
  const tCommon = useTranslations("common");
  const [updatePlanPrice, { isLoading }] = useUpdatePlanPriceMutation();

  async function handleSubmit(values: PlanPriceEditFormValues) {
    const result = await updatePlanPrice({
      planId,
      priceId: price.id,
      ...toUpdatePlanPricePayload(values),
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.editSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.editTitle")}</DialogTitle>
          <DialogDescription>{t("form.editDescription")}</DialogDescription>
        </DialogHeader>
        <PlanPriceForm
          mode="edit"
          defaultValues={{
            amount: price.amount,
            effectiveFrom: price.effectiveFrom ? price.effectiveFrom.slice(0, 10) : "",
            effectiveTo: price.effectiveTo ? price.effectiveTo.slice(0, 10) : "",
            isActive: price.isActive ? "true" : "false",
          }}
          isSubmitting={isLoading}
          submitLabel={tCommon("update")}
          cancelLabel={tCommon("cancel")}
          onCancel={() => onOpenChange(false)}
          onSubmit={(values) => handleSubmit(values as PlanPriceEditFormValues)}
        />
      </DialogContent>
    </Dialog>
  );
}
