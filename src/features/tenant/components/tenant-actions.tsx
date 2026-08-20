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
import { EditTenantDialog } from "@/features/tenant/components/edit-tenant-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import {
  useUpdateTenantStatusMutation,
  useCancelTenantMutation,
} from "@/features/tenant/api/tenant.api";
import type { Tenant, TenantStatus } from "@/types/platform";

type ActiveAction = "edit" | "status" | "cancel" | null;

const STATUS_OPTIONS: TenantStatus[] = ["DRAFT", "TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED"];

/** Industry-এর established row-actions pattern (Phase 5A) — kebab → permission-gated item → ActionConfirmDialog → RTK mutation। */
export function TenantRowActions({ tenant }: { tenant: Tenant }) {
  const t = useTranslations("tenants");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateTenantStatusMutation();
  const [cancelTenant, { isLoading: isCancelling }] = useCancelTenantMutation();

  async function handleStatusChange(values: Record<string, string>) {
    const result = await updateStatus({ id: tenant.id, status: values.status as TenantStatus });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.changeStatusSuccess"));
    setActiveAction(null);
  }

  async function handleCancel() {
    const result = await cancelTenant(tenant.id);
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
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.TENANT_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>{t("actions.edit")}</DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.TENANT_STATUS}>
            <DropdownMenuItem onSelect={() => setActiveAction("status")}>
              {t("actions.changeStatus")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.TENANT_DELETE}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("cancel")}>
              {t("actions.cancel")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "status"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.changeStatusTitle")}
        description={t("actions.changeStatusDescription", { name: tenant.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isUpdatingStatus}
        fields={[
          {
            name: "status",
            label: t("actions.statusFieldLabel"),
            type: "select",
            options: STATUS_OPTIONS.map((status) => ({ value: status, label: status })),
            required: true,
            requiredMessage: t("actions.statusRequired"),
          },
        ]}
        onConfirm={handleStatusChange}
      />

      <ActionConfirmDialog
        open={activeAction === "cancel"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.cancelTitle")}
        description={t("actions.cancelDescription", { name: tenant.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isCancelling}
        onConfirm={handleCancel}
      />

      <EditTenantDialog
        tenant={tenant}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />
    </>
  );
}
