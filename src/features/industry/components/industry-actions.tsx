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
import { EditIndustryDialog } from "@/features/industry/components/edit-industry-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import {
  useActivateIndustryMutation,
  useDeactivateIndustryMutation,
  useArchiveIndustryMutation,
  useUpdateIndustryStatusMutation,
} from "@/features/industry/api/industry.api";
import type { Industry, IndustryStatus } from "@/types/platform";

type ActiveAction = "activate" | "deactivate" | "archive" | "status" | "edit" | null;

const STATUS_OPTIONS: IndustryStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

/**
 * Industry-এর জন্য reusable action pattern (Phase 5A pattern-setter):
 * kebab menu → permission-gated item → ActionConfirmDialog → RTK
 * mutation → success/error toast → dialog শুধু success-এই close হয়,
 * `invalidatesTags: ["Industry"]` list automatically refresh করে।
 */
export function IndustryRowActions({ industry }: { industry: Industry }) {
  const t = useTranslations("industries");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [activate, { isLoading: isActivating }] = useActivateIndustryMutation();
  const [deactivate, { isLoading: isDeactivating }] = useDeactivateIndustryMutation();
  const [archive, { isLoading: isArchiving }] = useArchiveIndustryMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateIndustryStatusMutation();

  async function handleActivate() {
    const result = await activate(industry.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.activateSuccess"));
    setActiveAction(null);
  }

  async function handleDeactivate() {
    const result = await deactivate(industry.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.deactivateSuccess"));
    setActiveAction(null);
  }

  async function handleArchive() {
    const result = await archive(industry.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.archiveSuccess"));
    setActiveAction(null);
  }

  async function handleStatusChange(values: Record<string, string>) {
    const result = await updateStatus({ id: industry.id, status: values.status as IndustryStatus });
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
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INDUSTRY_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>
              {t("actions.edit")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INDUSTRY_ACTIVATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("activate")}>
              {t("actions.activate")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INDUSTRY_DEACTIVATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("deactivate")}>
              {t("actions.deactivate")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INDUSTRY_STATUS}>
            <DropdownMenuItem onSelect={() => setActiveAction("status")}>
              {t("actions.changeStatus")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INDUSTRY_DELETE}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("archive")}>
              {t("actions.archive")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "activate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.activateTitle")}
        description={t("actions.activateDescription", { name: industry.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isActivating}
        onConfirm={handleActivate}
      />

      <ActionConfirmDialog
        open={activeAction === "deactivate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.deactivateTitle")}
        description={t("actions.deactivateDescription", { name: industry.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isDeactivating}
        onConfirm={handleDeactivate}
      />

      <ActionConfirmDialog
        open={activeAction === "archive"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.archiveTitle")}
        description={t("actions.archiveDescription", { name: industry.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isArchiving}
        onConfirm={handleArchive}
      />

      <ActionConfirmDialog
        open={activeAction === "status"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.changeStatusTitle")}
        description={t("actions.changeStatusDescription", { name: industry.name })}
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

      <EditIndustryDialog
        industry={industry}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />
    </>
  );
}
