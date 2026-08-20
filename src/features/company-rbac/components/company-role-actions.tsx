"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { EditCompanyRoleDialog } from "@/features/company-rbac/components/edit-company-role-dialog";
import { ManageRolePermissionsDialog } from "@/features/company-rbac/components/manage-role-permissions-dialog";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { CompanyRole } from "@/types/company-rbac";

type ActiveAction = "edit" | "permissions" | null;

export function CompanyRoleRowActions({ companyId, role }: { companyId: string; role: CompanyRole }) {
  const t = useTranslations("companyRbac");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={tCommon("actions")}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.ROLE_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>
              {t("roles.actions.edit")}
            </DropdownMenuItem>
          </CompanyPermissionGate>
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.ROLE_PERMISSION_ASSIGN}>
            <DropdownMenuItem onSelect={() => setActiveAction("permissions")}>
              {t("roles.actions.managePermissions")}
            </DropdownMenuItem>
          </CompanyPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCompanyRoleDialog
        companyId={companyId}
        role={role}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />

      {activeAction === "permissions" && (
        <ManageRolePermissionsDialog
          companyId={companyId}
          role={role}
          open
          onOpenChange={(open) => !open && setActiveAction(null)}
        />
      )}
    </>
  );
}
