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
  useProcessBillingMutation,
  useRetryBillingMutation,
  useCancelBillingMutation,
  useSkipBillingMutation,
  useMarkBillingSucceededMutation,
  useMarkBillingFailedMutation,
} from "@/features/billing/api/billing.api";
import type { PlatformBilling } from "@/types/platform";

type ActiveAction = "process" | "retry" | "cancel" | "skip" | "markSucceeded" | "markFailed" | null;

/** Industry-এ established reusable action pattern-এর reuse — Billing module। */
export function BillingRowActions({ billing }: { billing: PlatformBilling }) {
  const t = useTranslations("billing");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [process, { isLoading: isProcessing }] = useProcessBillingMutation();
  const [retry, { isLoading: isRetrying }] = useRetryBillingMutation();
  const [cancel, { isLoading: isCancelling }] = useCancelBillingMutation();
  const [skip, { isLoading: isSkipping }] = useSkipBillingMutation();
  const [markSucceeded, { isLoading: isMarkingSucceeded }] = useMarkBillingSucceededMutation();
  const [markFailed, { isLoading: isMarkingFailed }] = useMarkBillingFailedMutation();

  async function handleProcess() {
    const result = await process(billing.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.processSuccess"));
    setActiveAction(null);
  }

  async function handleRetry() {
    const result = await retry(billing.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.retrySuccess"));
    setActiveAction(null);
  }

  async function handleCancel(values: Record<string, string>) {
    const result = await cancel({ id: billing.id, reason: values.reason || undefined });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.cancelSuccess"));
    setActiveAction(null);
  }

  async function handleSkip() {
    const result = await skip(billing.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.skipSuccess"));
    setActiveAction(null);
  }

  async function handleMarkSucceeded() {
    const result = await markSucceeded(billing.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.markSucceededSuccess"));
    setActiveAction(null);
  }

  async function handleMarkFailed(values: Record<string, string>) {
    const result = await markFailed({
      id: billing.id,
      failureCode: values.failureCode || undefined,
      failureMessage: values.failureMessage || undefined,
    });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.markFailedSuccess"));
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
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.BILLING_PROCESS}>
            <DropdownMenuItem onSelect={() => setActiveAction("process")}>
              {t("actions.process")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.BILLING_RETRY}>
            <DropdownMenuItem onSelect={() => setActiveAction("retry")}>
              {t("actions.retry")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.BILLING_SKIP}>
            <DropdownMenuItem onSelect={() => setActiveAction("skip")}>
              {t("actions.skip")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.BILLING_MARK_SUCCEEDED}>
            <DropdownMenuItem onSelect={() => setActiveAction("markSucceeded")}>
              {t("actions.markSucceeded")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.BILLING_MARK_FAILED}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("markFailed")}>
              {t("actions.markFailed")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.BILLING_CANCEL}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("cancel")}>
              {t("actions.cancel")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "process"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.processTitle")}
        description={t("actions.processDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isProcessing}
        onConfirm={handleProcess}
      />

      <ActionConfirmDialog
        open={activeAction === "retry"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.retryTitle")}
        description={t("actions.retryDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isRetrying}
        onConfirm={handleRetry}
      />

      <ActionConfirmDialog
        open={activeAction === "skip"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.skipTitle")}
        description={t("actions.skipDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isSkipping}
        onConfirm={handleSkip}
      />

      <ActionConfirmDialog
        open={activeAction === "markSucceeded"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.markSucceededTitle")}
        description={t("actions.markSucceededDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isMarkingSucceeded}
        onConfirm={handleMarkSucceeded}
      />

      <ActionConfirmDialog
        open={activeAction === "markFailed"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.markFailedTitle")}
        description={t("actions.markFailedDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isMarkingFailed}
        fields={[
          {
            name: "failureCode",
            label: t("actions.failureCodeFieldLabel"),
            type: "text",
            placeholder: t("actions.failureCodePlaceholder"),
            maxLength: 100,
            maxLengthMessage: t("actions.failureCodeTooLong"),
          },
          {
            name: "failureMessage",
            label: t("actions.failureMessageFieldLabel"),
            type: "textarea",
            placeholder: t("actions.failureMessagePlaceholder"),
            maxLength: 2000,
            maxLengthMessage: t("actions.failureMessageTooLong"),
          },
        ]}
        onConfirm={handleMarkFailed}
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
        fields={[
          {
            name: "reason",
            label: t("actions.reasonFieldLabel"),
            type: "textarea",
            placeholder: t("actions.reasonPlaceholder"),
            maxLength: 160,
            maxLengthMessage: t("actions.reasonTooLong"),
          },
        ]}
        onConfirm={handleCancel}
      />
    </>
  );
}
