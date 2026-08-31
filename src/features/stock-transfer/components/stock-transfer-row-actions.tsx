"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";

import {
  useDispatchStockTransferMutation,
  useReceiveStockTransferMutation,
} from "@/features/stock-transfer/api/stock-transfer.api";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { StockTransfer } from "@/types/stock-transfer";

/**
 * Exactly one action button per row, matching the transfer's current
 * state — Dispatch/Receive are the primary thing done with a
 * PENDING/IN_TRANSIT transfer, not secondary actions to tuck into a
 * kebab menu. Nothing renders for RECEIVED/CANCELLED.
 */
export function StockTransferRowActions({ companyId, transfer }: { companyId: string; transfer: StockTransfer }) {
  const t = useTranslations("stockTransfers");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  if (transfer.status === "PENDING") {
    return <DispatchAction companyId={companyId} transfer={transfer} t={t} tCommon={tCommon} locale={locale} />;
  }

  if (transfer.status === "IN_TRANSIT") {
    return <ReceiveAction companyId={companyId} transfer={transfer} t={t} tCommon={tCommon} locale={locale} />;
  }

  return null;
}

type ActionT = ReturnType<typeof useTranslations>;
type CommonT = ReturnType<typeof useTranslations>;

function DispatchAction({
  companyId,
  transfer,
  t,
  tCommon,
  locale,
}: {
  companyId: string;
  transfer: StockTransfer;
  t: ActionT;
  tCommon: CommonT;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const [dispatchStockTransfer, { isLoading }] = useDispatchStockTransferMutation();

  async function handleConfirm() {
    const result = await dispatchStockTransfer({ companyId, id: transfer.id });
    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }
    toast.success(t("dispatchDialog.success"));
    setOpen(false);
  }

  return (
    <>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.STOCK_TRANSFER_DISPATCH}>
        <Button size="sm" onClick={() => setOpen(true)}>
          {t("dispatchAction")}
        </Button>
      </CompanyPermissionGate>
      <ActionConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("dispatchDialog.title")}
        description={t("dispatchDialog.description")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isLoading}
        onConfirm={handleConfirm}
      />
    </>
  );
}

function ReceiveAction({
  companyId,
  transfer,
  t,
  tCommon,
  locale,
}: {
  companyId: string;
  transfer: StockTransfer;
  t: ActionT;
  tCommon: CommonT;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const [receiveStockTransfer, { isLoading }] = useReceiveStockTransferMutation();

  async function handleConfirm() {
    const result = await receiveStockTransfer({ companyId, id: transfer.id });
    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }
    toast.success(t("receiveDialog.success"));
    setOpen(false);
  }

  return (
    <>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.STOCK_TRANSFER_RECEIVE}>
        <Button size="sm" onClick={() => setOpen(true)}>
          {t("receiveAction")}
        </Button>
      </CompanyPermissionGate>
      <ActionConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("receiveDialog.title")}
        description={t("receiveDialog.description")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isLoading}
        onConfirm={handleConfirm}
      />
    </>
  );
}
