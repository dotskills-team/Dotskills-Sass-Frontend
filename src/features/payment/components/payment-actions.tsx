"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import { useVerifyPaymentMutation, useCancelPaymentMutation } from "@/features/payment/api/payment.api";
import type { PlatformPayment } from "@/types/platform";

type ActiveAction = "verify" | "cancel" | null;

/** Industry-এ established reusable action pattern-এর reuse — Payment module। */
export function PaymentRowActions({ payment }: { payment: PlatformPayment }) {
  const t = useTranslations("payments");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [verify, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [cancel, { isLoading: isCancelling }] = useCancelPaymentMutation();

  async function handleVerify(values: Record<string, string>) {
    const result = await verify({ id: payment.id, valId: values.valId });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.verifySuccess"));
    setActiveAction(null);
  }

  async function handleCancel() {
    const result = await cancel(payment.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.cancelSuccess"));
    setActiveAction(null);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={tCommon("actions")}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PAYMENT_VERIFY}>
            <DropdownMenuItem onSelect={() => setActiveAction("verify")}>
              {t("actions.verify")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PAYMENT_CANCEL}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("cancel")}>
              {t("actions.cancel")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "verify"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.verifyTitle")}
        description={t("actions.verifyDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isVerifying}
        fields={[
          {
            name: "valId",
            label: t("actions.valIdFieldLabel"),
            type: "text",
            placeholder: t("actions.valIdPlaceholder"),
            required: true,
            requiredMessage: t("actions.valIdRequired"),
          },
        ]}
        onConfirm={handleVerify}
      />

      <ActionConfirmDialog
        open={activeAction === "cancel"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.cancelTitle")}
        description={t("actions.cancelDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isCancelling}
        onConfirm={handleCancel}
      />
    </>
  );
}
