"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlatformStaffForm } from "@/features/platform-staff/components/platform-staff-form";
import {
  useReplacePlatformStaffRolesMutation,
  useUpdatePlatformStaffMutation,
} from "@/features/platform-staff/api/platform-staff.api";
import type { PlatformStaffFormValues } from "@/features/platform-staff/schemas/platform-staff.schema";
import { normalizeApiError } from "@/lib/api-error";
import type { PlatformStaffMember } from "@/types/platform-staff";

interface EditPlatformStaffDialogProps {
  staff: PlatformStaffMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * `UpdatePlatformStaffDto`-তে শুধু fullName/employeeCode — email/password এখানে নেই (verified)।
 * Role assignment আলাদা `PUT .../roles` endpoint (`ReplacePlatformRolesDto`), তাই edit submit-এ
 * profile update এবং role replace দুটো mutation sequential চালানো হয় — কিন্তু একটাই form-এ
 * একসাথে দেখানো হয় (UX-level consolidation, backend contract অপরিবর্তিত)।
 */
export function EditPlatformStaffDialog({ staff, open, onOpenChange }: EditPlatformStaffDialogProps) {
  const t = useTranslations("platformStaff");
  const tCommon = useTranslations("common");
  const [roleCodes, setRoleCodes] = useState<string[]>(() => staff.roles.map((r) => r.platformRole.code));
  const [rolesError, setRolesError] = useState(false);
  const [updateStaff, { isLoading: isUpdatingProfile }] = useUpdatePlatformStaffMutation();
  const [replaceRoles, { isLoading: isUpdatingRoles }] = useReplacePlatformStaffRolesMutation();

  async function handleSubmit(values: PlatformStaffFormValues) {
    if (roleCodes.length === 0) {
      setRolesError(true);
      return;
    }

    const profileResult = await updateStaff({
      id: staff.id,
      body: { fullName: values.fullName.trim(), employeeCode: values.employeeCode?.trim() || undefined },
    });

    if ("error" in profileResult) {
      toast.error(normalizeApiError(profileResult.error).message);
      return;
    }

    const rolesResult = await replaceRoles({ id: staff.id, roleCodes });

    if ("error" in rolesResult) {
      toast.error(normalizeApiError(rolesResult.error).message);
      return;
    }

    toast.success(t("form.editSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.editTitle")}</DialogTitle>
          <DialogDescription>{t("form.editDescription", { name: staff.user.fullName })}</DialogDescription>
        </DialogHeader>
        <PlatformStaffForm
          defaultValues={{
            email: staff.user.email,
            fullName: staff.user.fullName,
            password: "",
            employeeCode: staff.employeeCode ?? "",
          }}
          isSubmitting={isUpdatingProfile || isUpdatingRoles}
          submitLabel={tCommon("update")}
          cancelLabel={tCommon("cancel")}
          isCreate={false}
          roleCodes={roleCodes}
          onRoleCodesChange={(next) => {
            setRoleCodes(next);
            setRolesError(false);
          }}
          rolesError={rolesError}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
