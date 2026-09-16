"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";

import { useApproveNeedsReviewSaleMutation, useRejectNeedsReviewSaleMutation } from "@/features/sale/api/sale.api";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import type { Sale } from "@/types/sale";

/**
 * Owner/Manager-only (same `SALE_VOID` permission tier as void() — gated
 * one level up by the page itself). Approve re-attempts the stock
 * decrement now; if stock is still short the backend rejects it and this
 * sale simply stays NEEDS_REVIEW — never forces negative stock.
 */
export function NeedsReviewActions({ companyId, sale }: { companyId: string; sale: Sale }) {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveSale, { isLoading: isApproving }] = useApproveNeedsReviewSaleMutation();
  const [rejectSale, { isLoading: isRejecting }] = useRejectNeedsReviewSaleMutation();

  async function handleApprove() {
    const result = await approveSale({ companyId, id: sale.id });
    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }
    toast.success(t("needsReview.approveSuccess"));
  }

  async function handleReject(values: Record<string, string>) {
    const result = await rejectSale({ companyId, id: sale.id, body: { reason: values.reason } });
    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }
    toast.success(t("needsReview.rejectSuccess"));
    setRejectOpen(false);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" disabled={isApproving} onClick={handleApprove}>
        {t("needsReview.approveAction")}
      </Button>
      <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
        {t("needsReview.rejectAction")}
      </Button>
      <ActionConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={t("needsReview.rejectTitle")}
        description={t("needsReview.rejectDescription", { saleNumber: sale.saleNumber })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isRejecting}
        fields={[
          {
            name: "reason",
            label: t("needsReview.rejectReasonLabel"),
            type: "textarea",
            placeholder: t("needsReview.rejectReasonPlaceholder"),
            required: true,
            requiredMessage: t("needsReview.rejectReasonRequired"),
          },
        ]}
        onConfirm={handleReject}
      />
    </div>
  );
}
