"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
import { EditPlanDialog } from "@/features/plan/components/edit-plan-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import { useUpdatePlanStatusMutation, useArchivePlanMutation } from "@/features/plan/api/plan.api";
import type { Plan, PlanStatus } from "@/types/platform";

type ActiveAction = "status" | "archive" | "edit" | null;

const STATUS_OPTIONS: PlanStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

/** Industry-এ established reusable action pattern-এর reuse — Plan module। */
export function PlanRowActions({ plan }: { plan: Plan }) {
  const t = useTranslations("plans");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdatePlanStatusMutation();
  const [archive, { isLoading: isArchiving }] = useArchivePlanMutation();

  async function handleStatusChange(values: Record<string, string>) {
    const result = await updateStatus({ id: plan.id, status: values.status as PlanStatus });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.changeStatusSuccess"));
    setActiveAction(null);
  }

  async function handleArchive() {
    const result = await archive(plan.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.archiveSuccess"));
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
          <DropdownMenuItem onSelect={() => router.push(`/platform/plans/${plan.id}`)}>
            {t("actions.viewDetails")}
          </DropdownMenuItem>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>
              {t("actions.edit")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_STATUS}>
            <DropdownMenuItem onSelect={() => setActiveAction("status")}>
              {t("actions.changeStatus")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_ARCHIVE}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("archive")}>
              {t("actions.archive")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "status"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.changeStatusTitle")}
        description={t("actions.changeStatusDescription", { name: plan.name })}
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
        open={activeAction === "archive"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.archiveTitle")}
        description={t("actions.archiveDescription", { name: plan.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isArchiving}
        onConfirm={handleArchive}
      />

      <EditPlanDialog
        plan={plan}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />
    </>
  );
}
