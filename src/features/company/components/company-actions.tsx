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
import { EditCompanyDialog } from "@/features/company/components/edit-company-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import {
  useActivateCompanyMutation,
  useSuspendCompanyMutation,
  useUpdateCompanyStatusMutation,
} from "@/features/company/api/company.api";
import type { Company, CompanyStatus } from "@/types/platform";

type ActiveAction = "activate" | "suspend" | "status" | "edit" | null;

const STATUS_OPTIONS: CompanyStatus[] = [
  "DRAFT",
  "ONBOARDING",
  "READY",
  "LIVE",
  "SUSPENDED",
  "CLOSED",
];

/** Industry-এ established reusable action pattern-এর reuse — Company module। */
export function CompanyRowActions({ company }: { company: Company }) {
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [activate, { isLoading: isActivating }] = useActivateCompanyMutation();
  const [suspend, { isLoading: isSuspending }] = useSuspendCompanyMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateCompanyStatusMutation();

  async function handleActivate() {
    const result = await activate(company.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.activateSuccess"));
    setActiveAction(null);
  }

  async function handleSuspend() {
    const result = await suspend(company.id);
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.suspendSuccess"));
    setActiveAction(null);
  }

  async function handleStatusChange(values: Record<string, string>) {
    const result = await updateStatus({ id: company.id, status: values.status as CompanyStatus });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.changeStatusSuccess"));
    setActiveAction(null);
  }

  const displayName = company.tradeName || company.legalName;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={tCommon("actions")}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>{t("actions.edit")}</DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_ACTIVATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("activate")}>
              {t("actions.activate")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_STATUS}>
            <DropdownMenuItem onSelect={() => setActiveAction("status")}>
              {t("actions.changeStatus")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_SUSPEND}>
            <DropdownMenuItem variant="destructive" onSelect={() => setActiveAction("suspend")}>
              {t("actions.suspend")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "activate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.activateTitle")}
        description={t("actions.activateDescription", { name: displayName })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isActivating}
        onConfirm={handleActivate}
      />

      <ActionConfirmDialog
        open={activeAction === "suspend"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.suspendTitle")}
        description={t("actions.suspendDescription", { name: displayName })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isSuspending}
        onConfirm={handleSuspend}
      />

      <ActionConfirmDialog
        open={activeAction === "status"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.changeStatusTitle")}
        description={t("actions.changeStatusDescription", { name: displayName })}
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

      <EditCompanyDialog
        company={company}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />
    </>
  );
}
