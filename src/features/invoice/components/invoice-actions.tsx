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
import {
  useIssueInvoiceMutation,
  useCancelInvoiceMutation,
  useVoidInvoiceMutation,
  useMarkInvoicePaidMutation,
} from "@/features/invoice/api/invoice.api";
import type { PlatformInvoice } from "@/types/platform";

type ActiveAction = "issue" | "cancel" | "void" | "markPaid" | null;

/** Industry-এ established reusable action pattern-এর reuse — Invoice module। */
export function InvoiceRowActions({ invoice }: { invoice: PlatformInvoice }) {
  const t = useTranslations("invoices");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [issue, { isLoading: isIssuing }] = useIssueInvoiceMutation();
  const [cancel, { isLoading: isCancelling }] = useCancelInvoiceMutation();
  const [voidInvoice, { isLoading: isVoiding }] = useVoidInvoiceMutation();
  const [markPaid, { isLoading: isMarkingPaid }] = useMarkInvoicePaidMutation();

  async function handleIssue() {
    const result = await issue(invoice.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.issueSuccess"));
    setActiveAction(null);
  }

  async function handleCancel() {
    const result = await cancel(invoice.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.cancelSuccess"));
    setActiveAction(null);
  }

  async function handleVoid() {
    const result = await voidInvoice(invoice.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.voidSuccess"));
    setActiveAction(null);
  }

  async function handleMarkPaid() {
    const result = await markPaid(invoice.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.markPaidSuccess"));
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
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INVOICE_ISSUE}>
            <DropdownMenuItem onSelect={() => setActiveAction("issue")}>
              {t("actions.issue")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INVOICE_MARK_PAID}>
            <DropdownMenuItem onSelect={() => setActiveAction("markPaid")}>
              {t("actions.markPaid")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INVOICE_CANCEL}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("cancel")}>
              {t("actions.cancel")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INVOICE_VOID}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("void")}>
              {t("actions.void")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "issue"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.issueTitle")}
        description={t("actions.issueDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isIssuing}
        onConfirm={handleIssue}
      />

      <ActionConfirmDialog
        open={activeAction === "markPaid"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.markPaidTitle")}
        description={t("actions.markPaidDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isMarkingPaid}
        onConfirm={handleMarkPaid}
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

      <ActionConfirmDialog
        open={activeAction === "void"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.voidTitle")}
        description={t("actions.voidDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isVoiding}
        onConfirm={handleVoid}
      />
    </>
  );
}
