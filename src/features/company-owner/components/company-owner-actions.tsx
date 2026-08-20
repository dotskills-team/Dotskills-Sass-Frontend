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
import { EditCompanyOwnerDialog } from "@/features/company-owner/components/edit-company-owner-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import {
  useChangePrimaryCompanyOwnerMutation,
  useUpdateCompanyOwnerStatusMutation,
} from "@/features/company-owner/api/company-owner.api";
import type { CompanyOwnership } from "@/types/company-owner";
import type { CompanyMembershipStatus } from "@/types/platform";

type ActiveAction = "edit" | "status" | "makePrimary" | null;

const STATUS_OPTIONS: CompanyMembershipStatus[] = ["INVITED", "ACTIVE", "SUSPENDED", "REVOKED"];

/** Industry-এর established row-actions pattern reuse — Company Owner module। */
export function CompanyOwnerRowActions({
  companyId,
  ownership,
}: {
  companyId: string;
  ownership: CompanyOwnership;
}) {
  const t = useTranslations("companyOwners");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [changePrimary, { isLoading: isChangingPrimary }] = useChangePrimaryCompanyOwnerMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateCompanyOwnerStatusMutation();

  const user = ownership.companyMember.user;

  async function handleMakePrimary() {
    const result = await changePrimary({ companyId, ownerMemberId: ownership.companyMemberId });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.makePrimarySuccess"));
    setActiveAction(null);
  }

  async function handleStatusChange(values: Record<string, string>) {
    const result = await updateStatus({
      companyId,
      ownerMemberId: ownership.companyMemberId,
      status: values.status as CompanyMembershipStatus,
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
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_OWNER_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>{t("actions.edit")}</DropdownMenuItem>
          </PlatformPermissionGate>
          {!ownership.isPrimary && (
            <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_OWNER_CHANGE}>
              <DropdownMenuItem onSelect={() => setActiveAction("makePrimary")}>
                {t("actions.makePrimary")}
              </DropdownMenuItem>
            </PlatformPermissionGate>
          )}
          <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_OWNER_STATUS}>
            <DropdownMenuItem onSelect={() => setActiveAction("status")}>
              {t("actions.changeStatus")}
            </DropdownMenuItem>
          </PlatformPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "makePrimary"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.makePrimaryTitle")}
        description={t("actions.makePrimaryDescription", { name: user.fullName })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isChangingPrimary}
        onConfirm={handleMakePrimary}
      />

      <ActionConfirmDialog
        open={activeAction === "status"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.changeStatusTitle")}
        description={t("actions.changeStatusDescription", { name: user.fullName })}
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

      <EditCompanyOwnerDialog
        companyId={companyId}
        ownership={ownership}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />
    </>
  );
}
