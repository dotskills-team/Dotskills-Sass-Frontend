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
} from "@/features/billing/api/billing.api";
import type { PlatformBilling } from "@/types/platform";

type ActiveAction = "process" | "retry" | null;

/**
 * Billing is system-generated only — no manual create/cancel/skip/mark
 * actions exist any more. `process`/`retry` remain as the Platform Admin's
 * manual re-attempt tools for a Billing the system already generated
 * (via checkout/renewal/manual payment) — they advance an existing row
 * through the exact same settlement path a real payment attempt uses,
 * never create anything new.
 */
export function BillingRowActions({ billing }: { billing: PlatformBilling }) {
  const t = useTranslations("billing");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [process, { isLoading: isProcessing }] = useProcessBillingMutation();
  const [retry, { isLoading: isRetrying }] = useRetryBillingMutation();

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
    </>
  );
}
