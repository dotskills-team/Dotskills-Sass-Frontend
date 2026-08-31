"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";

import { useVoidSaleMutation } from "@/features/sale/api/sale.api";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import type { Sale } from "@/types/sale";

export function VoidSaleDialog({ companyId, sale }: { companyId: string; sale: Sale }) {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [voidSale, { isLoading }] = useVoidSaleMutation();

  async function handleConfirm(values: Record<string, string>) {
    const result = await voidSale({ companyId, id: sale.id, body: { reason: values.reason } });
    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }
    toast.success(t("detail.voidSuccess"));
    setOpen(false);
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        {t("detail.voidAction")}
      </Button>
      <ActionConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("detail.voidTitle")}
        description={t("detail.voidDescription", { saleNumber: sale.saleNumber })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isLoading}
        fields={[
          {
            name: "reason",
            label: t("detail.voidReasonLabel"),
            type: "textarea",
            placeholder: t("detail.voidReasonPlaceholder"),
            required: true,
            requiredMessage: t("detail.voidReasonRequired"),
          },
        ]}
        onConfirm={handleConfirm}
      />
    </>
  );
}
