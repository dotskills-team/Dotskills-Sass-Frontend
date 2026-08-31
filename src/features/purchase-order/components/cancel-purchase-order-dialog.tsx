"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";

import { useCancelPurchaseOrderMutation } from "@/features/purchase-order/api/purchase-order.api";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import type { PurchaseOrder } from "@/types/purchase-order";

export function CancelPurchaseOrderDialog({ companyId, order }: { companyId: string; order: PurchaseOrder }) {
  const t = useTranslations("purchaseOrders");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [cancelPurchaseOrder, { isLoading }] = useCancelPurchaseOrderMutation();

  async function handleConfirm() {
    const result = await cancelPurchaseOrder({ companyId, id: order.id });
    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }
    toast.success(t("detail.cancelSuccess"));
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {t("detail.cancelAction")}
      </Button>
      <ActionConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("detail.cancelTitle")}
        description={t("detail.cancelDescription", { orderNumber: order.orderNumber })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isLoading}
        onConfirm={handleConfirm}
      />
    </>
  );
}
