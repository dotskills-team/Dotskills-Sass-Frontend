"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";
import { ChangePlanDialog } from "@/features/company-subscription/components/change-plan-dialog";
import {
  useCancelCompanySubscriptionMutation,
  useReactivateCompanySubscriptionMutation,
  useUpdateSubscriptionAutoRenewMutation,
} from "@/features/company-subscription/api/company-subscription.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanySubscriptionBase } from "@/types/company-subscription";

type ActiveAction = "auto-renew" | "cancel" | "reactivate" | null;

export function SubscriptionActions({ subscription }: { subscription: CompanySubscriptionBase }) {
  const t = useTranslations("companySubscription");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [updateAutoRenew, { isLoading: isTogglingAutoRenew }] = useUpdateSubscriptionAutoRenewMutation();
  const [cancel, { isLoading: isCancelling }] = useCancelCompanySubscriptionMutation();
  const [reactivate, { isLoading: isReactivating }] = useReactivateCompanySubscriptionMutation();

  const canChangeLifecycle = subscription.status !== "CANCELLED" && subscription.status !== "EXPIRED";
  const canReactivate =
    subscription.status === "CANCELLED" && new Date(subscription.currentPeriodEnd) > new Date();

  async function handleToggleAutoRenew() {
    const result = await updateAutoRenew({ id: subscription.id, autoRenew: !subscription.autoRenew });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(subscription.autoRenew ? t("actions.autoRenewDisabledSuccess") : t("actions.autoRenewEnabledSuccess"));
    setActiveAction(null);
  }

  async function handleCancel(values: Record<string, string>) {
    const result = await cancel({ id: subscription.id, reason: values.reason });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.cancelSuccess"));
    setActiveAction(null);
  }

  async function handleReactivate() {
    const result = await reactivate(subscription.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.reactivateSuccess"));
    setActiveAction(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canChangeLifecycle && <ChangePlanDialog subscription={subscription} />}

      {canChangeLifecycle && (
        <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUBSCRIPTION_AUTO_RENEW}>
          <Button variant="outline" size="sm" onClick={() => setActiveAction("auto-renew")}>
            {subscription.autoRenew ? t("actions.disableAutoRenew") : t("actions.enableAutoRenew")}
          </Button>
        </CompanyPermissionGate>
      )}

      {canChangeLifecycle && (
        <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUBSCRIPTION_CANCEL}>
          <Button variant="outline" size="sm" onClick={() => setActiveAction("cancel")}>
            {t("actions.cancel")}
          </Button>
        </CompanyPermissionGate>
      )}

      {canReactivate && (
        <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUBSCRIPTION_REACTIVATE}>
          <Button size="sm" onClick={() => setActiveAction("reactivate")}>
            {t("actions.reactivate")}
          </Button>
        </CompanyPermissionGate>
      )}

      <ActionConfirmDialog
        open={activeAction === "auto-renew"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={subscription.autoRenew ? t("actions.disableAutoRenewTitle") : t("actions.enableAutoRenewTitle")}
        description={subscription.autoRenew ? t("actions.disableAutoRenewDescription") : t("actions.enableAutoRenewDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isTogglingAutoRenew}
        onConfirm={handleToggleAutoRenew}
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
            label: t("actions.cancelReasonLabel"),
            type: "textarea",
            placeholder: t("actions.cancelReasonPlaceholder"),
          },
        ]}
        onConfirm={handleCancel}
      />

      <ActionConfirmDialog
        open={activeAction === "reactivate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.reactivateTitle")}
        description={t("actions.reactivateDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isReactivating}
        onConfirm={handleReactivate}
      />
    </div>
  );
}
