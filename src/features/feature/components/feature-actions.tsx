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
import { EditFeatureDialog } from "@/features/feature/components/edit-feature-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import {
  useActivateFeatureMutation,
  useDeactivateFeatureMutation,
  useArchiveFeatureMutation,
  useUpdateFeatureStatusMutation,
} from "@/features/feature/api/feature.api";
import type { Feature, FeatureStatus } from "@/types/platform";

type ActiveAction = "activate" | "deactivate" | "archive" | "status" | "edit" | null;

const STATUS_OPTIONS: FeatureStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

/** Industry-এ established reusable action pattern-এর reuse — Feature module। */
export function FeatureRowActions({ feature }: { feature: Feature }) {
  const t = useTranslations("features");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [activate, { isLoading: isActivating }] = useActivateFeatureMutation();
  const [deactivate, { isLoading: isDeactivating }] = useDeactivateFeatureMutation();
  const [archive, { isLoading: isArchiving }] = useArchiveFeatureMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateFeatureStatusMutation();

  async function handleActivate() {
    const result = await activate(feature.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.activateSuccess"));
    setActiveAction(null);
  }

  async function handleDeactivate() {
    const result = await deactivate(feature.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.deactivateSuccess"));
    setActiveAction(null);
  }

  async function handleArchive() {
    const result = await archive(feature.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.archiveSuccess"));
    setActiveAction(null);
  }

  async function handleStatusChange(values: Record<string, string>) {
    const result = await updateStatus({ id: feature.id, status: values.status as FeatureStatus });
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
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.FEATURE_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>
              {t("actions.edit")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.FEATURE_ACTIVATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("activate")}>
              {t("actions.activate")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.FEATURE_DEACTIVATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("deactivate")}>
              {t("actions.deactivate")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.FEATURE_STATUS}>
            <DropdownMenuItem onSelect={() => setActiveAction("status")}>
              {t("actions.changeStatus")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.FEATURE_ARCHIVE}>
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
        description={t("actions.activateDescription", { name: feature.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isActivating}
        onConfirm={handleActivate}
      />

      <ActionConfirmDialog
        open={activeAction === "deactivate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.deactivateTitle")}
        description={t("actions.deactivateDescription", { name: feature.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isDeactivating}
        onConfirm={handleDeactivate}
      />

      <ActionConfirmDialog
        open={activeAction === "archive"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.archiveTitle")}
        description={t("actions.archiveDescription", { name: feature.name })}
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
        description={t("actions.changeStatusDescription", { name: feature.name })}
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

      <EditFeatureDialog
        feature={feature}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />
    </>
  );
}
