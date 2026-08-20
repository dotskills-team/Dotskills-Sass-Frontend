"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PermissionChecklist } from "@/components/shared/permission-checklist";
import {
  useListCompanyPermissionsQuery,
  useReplaceCompanyRolePermissionsMutation,
} from "@/features/company-rbac/api/company-rbac.api";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanyRole } from "@/types/company-rbac";

interface ManageRolePermissionsDialogProps {
  companyId: string;
  role: CompanyRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * `ReplaceCompanyRolePermissionsDto`-তে প্রতিটা entry `{code, effect}` — এই UI শুধু ALLOW
 * grant করে (checked = ALLOW, unchecked = absent)। DENY effect এখানে exposed নয় — সেটা একটা
 * সচেতন simplification, backend পুরোপুরি DENY সমর্থন করে কিন্তু per-permission ALLOW/DENY
 * toggle UI-এর scope বাইরে (report-এ উল্লেখ করা হয়েছে)। COMPANY_OWNER role-এর জন্য backend
 * নিজেই সব permission বাধ্যতামূলক রাখে (verified) — client-side আলাদা guard বসানো হয়নি।
 */
export function ManageRolePermissionsDialog({
  companyId,
  role,
  open,
  onOpenChange,
}: ManageRolePermissionsDialogProps) {
  const t = useTranslations("companyRbac");
  const tCommon = useTranslations("common");
  const { data: permissions } = useListCompanyPermissionsQuery(companyId);
  const [replacePermissions, { isLoading }] = useReplaceCompanyRolePermissionsMutation();

  const [selected, setSelected] = useState<string[]>(() =>
    role.permissions.filter((p) => p.effect === "ALLOW").map((p) => p.permission.code),
  );

  async function handleSubmit() {
    if (selected.length === 0) {
      toast.error(t("roles.form.permissionsRequired"));
      return;
    }

    const result = await replacePermissions({
      companyId,
      roleId: role.id,
      permissions: selected.map((code) => ({ code, effect: "ALLOW" as const })),
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("roles.permissions.updateSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("roles.permissions.title")}</DialogTitle>
          <DialogDescription>{t("roles.permissions.description", { name: role.name })}</DialogDescription>
        </DialogHeader>

        <PermissionChecklist permissions={permissions ?? []} value={selected} onChange={setSelected} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
