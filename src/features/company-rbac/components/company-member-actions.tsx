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
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";
import { AssignMemberRolesDialog } from "@/features/company-rbac/components/assign-member-roles-dialog";
import { AssignMemberScopesDialog } from "@/features/company-rbac/components/assign-member-scopes-dialog";
import { AssignMemberLocationsDialog } from "@/features/company-rbac/components/assign-member-locations-dialog";
import { useUpdateCompanyMemberStatusMutation } from "@/features/company-rbac/api/company-rbac.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanyMember } from "@/types/company-rbac";

type ActiveAction = "roles" | "scopes" | "locations" | "status" | null;

const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "REVOKED"] as const;

export function CompanyMemberRowActions({ companyId, member }: { companyId: string; member: CompanyMember }) {
  const t = useTranslations("companyRbac");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateCompanyMemberStatusMutation();

  async function handleStatusChange(values: Record<string, string>) {
    const result = await updateStatus({
      companyId,
      memberId: member.id,
      status: values.status as "ACTIVE" | "SUSPENDED" | "REVOKED",
    });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("members.actions.changeStatusSuccess"));
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
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.MEMBER_ROLE_ASSIGN}>
            <DropdownMenuItem onSelect={() => setActiveAction("roles")}>
              {t("members.actions.assignRoles")}
            </DropdownMenuItem>
          </CompanyPermissionGate>
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.MEMBER_SCOPE_ASSIGN}>
            <DropdownMenuItem onSelect={() => setActiveAction("scopes")}>
              {t("members.actions.assignScopes")}
            </DropdownMenuItem>
          </CompanyPermissionGate>
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.MEMBER_SCOPE_ASSIGN}>
            <DropdownMenuItem onSelect={() => setActiveAction("locations")}>
              {t("members.actions.assignLocations")}
            </DropdownMenuItem>
          </CompanyPermissionGate>
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.MEMBER_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("status")}>
              {t("members.actions.changeStatus")}
            </DropdownMenuItem>
          </CompanyPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeAction === "roles" && (
        <AssignMemberRolesDialog
          companyId={companyId}
          member={member}
          open
          onOpenChange={(open) => !open && setActiveAction(null)}
        />
      )}

      {activeAction === "scopes" && (
        <AssignMemberScopesDialog
          companyId={companyId}
          member={member}
          open
          onOpenChange={(open) => !open && setActiveAction(null)}
        />
      )}

      {activeAction === "locations" && (
        <AssignMemberLocationsDialog
          companyId={companyId}
          member={member}
          open
          onOpenChange={(open) => !open && setActiveAction(null)}
        />
      )}

      <ActionConfirmDialog
        open={activeAction === "status"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("members.actions.changeStatusTitle")}
        description={t("members.actions.changeStatusDescription", { name: member.user.fullName })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isUpdatingStatus}
        fields={[
          {
            name: "status",
            label: t("members.actions.statusFieldLabel"),
            type: "select",
            options: STATUS_OPTIONS.map((status) => ({ value: status, label: status })),
            required: true,
            requiredMessage: t("members.actions.statusRequired"),
          },
        ]}
        onConfirm={handleStatusChange}
      />
    </>
  );
}
