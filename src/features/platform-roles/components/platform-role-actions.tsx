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
import { EditPlatformRoleDialog } from "@/features/platform-roles/components/edit-platform-role-dialog";
import { ManagePlatformRolePermissionsDialog } from "@/features/platform-roles/components/manage-platform-role-permissions-dialog";
import { useUpdatePlatformRoleStatusMutation } from "@/features/platform-roles/api/platform-role.api";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { PlatformRole, PlatformRoleStatus } from "@/types/platform-role";

type ActiveAction = "edit" | "permissions" | "status" | null;

const STATUS_OPTIONS: PlatformRoleStatus[] = ["ACTIVE", "INACTIVE"];

export function PlatformRoleRowActions({ role }: { role: PlatformRole }) {
  const t = useTranslations("platformRoles");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdatePlatformRoleStatusMutation();

  async function handleStatusChange(values: Record<string, string>) {
    const result = await updateStatus({ id: role.id, status: values.status as PlatformRoleStatus });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.changeStatusSuccess"));
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
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.ROLE_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>{t("actions.edit")}</DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.ROLE_PERMISSION_ASSIGN}>
            <DropdownMenuItem onSelect={() => setActiveAction("permissions")}>
              {t("actions.managePermissions")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.ROLE_STATUS}>
            <DropdownMenuItem
              disabled={role.isSystem}
              onSelect={() => setActiveAction("status")}
            >
              {t("actions.changeStatus")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPlatformRoleDialog
        role={role}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />

      {activeAction === "permissions" && (
        <ManagePlatformRolePermissionsDialog
          role={role}
          open
          onOpenChange={(open) => !open && setActiveAction(null)}
        />
      )}

      <ActionConfirmDialog
        open={activeAction === "status"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.changeStatusTitle")}
        description={t("actions.changeStatusDescription", { name: role.name })}
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
    </>
  );
}
