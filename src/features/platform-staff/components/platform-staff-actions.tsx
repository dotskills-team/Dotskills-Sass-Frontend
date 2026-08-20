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
import { EditPlatformStaffDialog } from "@/features/platform-staff/components/edit-platform-staff-dialog";
import { useUpdatePlatformStaffStatusMutation } from "@/features/platform-staff/api/platform-staff.api";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { PlatformStaffMember } from "@/types/platform-staff";

type ActiveAction = "edit" | "status" | null;

const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "REVOKED"] as const;

export function PlatformStaffRowActions({ staff }: { staff: PlatformStaffMember }) {
  const t = useTranslations("platformStaff");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdatePlatformStaffStatusMutation();

  async function handleStatusChange(values: Record<string, string>) {
    const result = await updateStatus({
      id: staff.id,
      status: values.status as "ACTIVE" | "SUSPENDED" | "REVOKED",
    });
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
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.STAFF_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>{t("actions.edit")}</DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.STAFF_STATUS}>
            <DropdownMenuItem onSelect={() => setActiveAction("status")}>
              {t("actions.changeStatus")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPlatformStaffDialog
        staff={staff}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />

      <ActionConfirmDialog
        open={activeAction === "status"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.changeStatusTitle")}
        description={t("actions.changeStatusDescription", { name: staff.user.fullName })}
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
