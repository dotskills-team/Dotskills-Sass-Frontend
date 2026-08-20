"use client";

import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlatformRolePermissionsEditor } from "@/features/platform-roles/components/platform-role-permissions-editor";
import type { PlatformRole } from "@/types/platform-role";

interface ManagePlatformRolePermissionsDialogProps {
  role: PlatformRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManagePlatformRolePermissionsDialog({
  role,
  open,
  onOpenChange,
}: ManagePlatformRolePermissionsDialogProps) {
  const t = useTranslations("platformRoles");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("permissions.title")}</DialogTitle>
          <DialogDescription>{t("permissions.description", { name: role.name })}</DialogDescription>
        </DialogHeader>
        <PlatformRolePermissionsEditor role={role} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
