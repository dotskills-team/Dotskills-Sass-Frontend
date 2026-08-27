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
import { ActionConfirmDialog, type ActionFieldConfig } from "@/components/shared/action-confirm-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import {
  useSuspendSubscriptionMutation,
  useReactivateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useExpireSubscriptionMutation,
  useRenewSubscriptionMutation,
  useUpdatePlatformSubscriptionAutoRenewMutation,
} from "@/features/subscription/api/subscription.api";
import type { PlatformSubscription } from "@/types/platform";

type ActiveAction = "suspend" | "reactivate" | "cancel" | "expire" | "renew" | "auto-renew" | null;

/** Industry-এ established reusable action pattern-এর reuse — Subscription module। */
export function SubscriptionRowActions({ subscription }: { subscription: PlatformSubscription }) {
  const t = useTranslations("subscriptions");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [suspend, { isLoading: isSuspending }] = useSuspendSubscriptionMutation();
  const [reactivate, { isLoading: isReactivating }] = useReactivateSubscriptionMutation();
  const [cancel, { isLoading: isCancelling }] = useCancelSubscriptionMutation();
  const [expire, { isLoading: isExpiring }] = useExpireSubscriptionMutation();
  const [renew, { isLoading: isRenewing }] = useRenewSubscriptionMutation();
  const [updateAutoRenew, { isLoading: isTogglingAutoRenew }] = useUpdatePlatformSubscriptionAutoRenewMutation();

  const reasonField: ActionFieldConfig = {
    name: "reason",
    label: t("actions.reasonFieldLabel"),
    type: "textarea",
    placeholder: t("actions.reasonPlaceholder"),
    required: true,
    minLength: 3,
    maxLength: 500,
    requiredMessage: t("actions.reasonRequired"),
    minLengthMessage: t("actions.reasonTooShort"),
    maxLengthMessage: t("actions.reasonTooLong"),
  };

  async function handleSuspend(values: Record<string, string>) {
    const result = await suspend({ id: subscription.id, reason: values.reason });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.suspendSuccess"));
    setActiveAction(null);
  }

  async function handleReactivate(values: Record<string, string>) {
    const result = await reactivate({ id: subscription.id, reason: values.reason });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.reactivateSuccess"));
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

  async function handleExpire(values: Record<string, string>) {
    const result = await expire({ id: subscription.id, reason: values.reason });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.expireSuccess"));
    setActiveAction(null);
  }

  /** Idempotent — safe to confirm again if clicked twice (verified live: re-issues the same, already-created Invoice, never a duplicate). */
  async function handleRenew() {
    const result = await renew({ id: subscription.id });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.renewSuccess"));
    setActiveAction(null);
  }

  async function handleToggleAutoRenew() {
    const result = await updateAutoRenew({ id: subscription.id, autoRenew: !subscription.autoRenew });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(subscription.autoRenew ? t("actions.autoRenewDisabledSuccess") : t("actions.autoRenewEnabledSuccess"));
    setActiveAction(null);
  }

  const planName = subscription.plan?.name ?? subscription.id;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={tCommon("actions")}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SUBSCRIPTION_RENEW}>
            <DropdownMenuItem onSelect={() => setActiveAction("renew")}>
              {t("actions.renew")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SUBSCRIPTION_AUTO_RENEW}>
            <DropdownMenuItem onSelect={() => setActiveAction("auto-renew")}>
              {subscription.autoRenew ? t("actions.disableAutoRenew") : t("actions.enableAutoRenew")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SUBSCRIPTION_SUSPEND}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("suspend")}>
              {t("actions.suspend")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SUBSCRIPTION_REACTIVATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("reactivate")}>
              {t("actions.reactivate")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SUBSCRIPTION_CANCEL}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("cancel")}>
              {t("actions.cancel")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SUBSCRIPTION_EXPIRE}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("expire")}>
              {t("actions.expire")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "renew"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.renewTitle")}
        description={t("actions.renewDescription", { plan: planName })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isRenewing}
        fields={[]}
        onConfirm={handleRenew}
      />

      <ActionConfirmDialog
        open={activeAction === "auto-renew"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={subscription.autoRenew ? t("actions.disableAutoRenewTitle") : t("actions.enableAutoRenewTitle")}
        description={
          subscription.autoRenew
            ? t("actions.disableAutoRenewDescription", { plan: planName })
            : t("actions.enableAutoRenewDescription", { plan: planName })
        }
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isTogglingAutoRenew}
        fields={[]}
        onConfirm={handleToggleAutoRenew}
      />

      <ActionConfirmDialog
        open={activeAction === "suspend"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.suspendTitle")}
        description={t("actions.suspendDescription", { plan: planName })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isSuspending}
        fields={[reasonField]}
        onConfirm={handleSuspend}
      />

      <ActionConfirmDialog
        open={activeAction === "reactivate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.reactivateTitle")}
        description={t("actions.reactivateDescription", { plan: planName })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isReactivating}
        fields={[reasonField]}
        onConfirm={handleReactivate}
      />

      <ActionConfirmDialog
        open={activeAction === "cancel"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.cancelTitle")}
        description={t("actions.cancelDescription", { plan: planName })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isCancelling}
        fields={[reasonField]}
        onConfirm={handleCancel}
      />

      <ActionConfirmDialog
        open={activeAction === "expire"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.expireTitle")}
        description={t("actions.expireDescription", { plan: planName })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isExpiring}
        fields={[reasonField]}
        onConfirm={handleExpire}
      />
    </>
  );
}
