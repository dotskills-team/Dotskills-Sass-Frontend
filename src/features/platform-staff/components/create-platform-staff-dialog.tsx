"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { PlatformStaffForm } from "@/features/platform-staff/components/platform-staff-form";
import { useCreatePlatformStaffMutation } from "@/features/platform-staff/api/platform-staff.api";
import type { PlatformStaffFormValues } from "@/features/platform-staff/schemas/platform-staff.schema";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";

const EMPTY_VALUES: PlatformStaffFormValues = {
  email: "",
  fullName: "",
  password: "",
  employeeCode: "",
};

export function CreatePlatformStaffDialog() {
  const t = useTranslations("platformStaff");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [roleCodes, setRoleCodes] = useState<string[]>([]);
  const [rolesError, setRolesError] = useState(false);
  const [createStaff, { isLoading }] = useCreatePlatformStaffMutation();

  async function handleSubmit(values: PlatformStaffFormValues) {
    if (roleCodes.length === 0) {
      setRolesError(true);
      return;
    }

    const result = await createStaff({
      email: values.email.trim(),
      fullName: values.fullName.trim(),
      password: values.password ?? "",
      employeeCode: values.employeeCode?.trim() || undefined,
      roleCodes,
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    handleOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setRoleCodes([]);
      setRolesError(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.STAFF_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <PlatformStaffForm
          defaultValues={EMPTY_VALUES}
          isSubmitting={isLoading}
          submitLabel={tCommon("create")}
          cancelLabel={tCommon("cancel")}
          isCreate
          roleCodes={roleCodes}
          onRoleCodesChange={(next) => {
            setRoleCodes(next);
            setRolesError(false);
          }}
          rolesError={rolesError}
          onCancel={() => handleOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
