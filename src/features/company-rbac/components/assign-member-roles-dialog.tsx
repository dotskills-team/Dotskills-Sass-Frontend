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
import { RoleChecklist } from "@/components/shared/role-checklist";
import {
  useListCompanyRolesQuery,
  useReplaceCompanyMemberRolesMutation,
} from "@/features/company-rbac/api/company-rbac.api";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanyMember } from "@/types/company-rbac";

interface AssignMemberRolesDialogProps {
  companyId: string;
  member: CompanyMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignMemberRolesDialog({ companyId, member, open, onOpenChange }: AssignMemberRolesDialogProps) {
  const t = useTranslations("companyRbac");
  const tCommon = useTranslations("common");
  const { data: roles } = useListCompanyRolesQuery(companyId);
  const [replaceRoles, { isLoading }] = useReplaceCompanyMemberRolesMutation();

  const [selected, setSelected] = useState<string[]>(() => member.roles.map((r) => r.companyRole.code));

  async function handleSubmit() {
    if (selected.length === 0) {
      toast.error(t("members.form.rolesRequired"));
      return;
    }

    const result = await replaceRoles({ companyId, memberId: member.id, roleCodes: selected });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("members.actions.assignRolesSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("members.actions.assignRolesTitle")}</DialogTitle>
          <DialogDescription>
            {t("members.actions.assignRolesDescription", { name: member.user.fullName })}
          </DialogDescription>
        </DialogHeader>

        <RoleChecklist roles={roles ?? []} value={selected} onChange={setSelected} />

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
