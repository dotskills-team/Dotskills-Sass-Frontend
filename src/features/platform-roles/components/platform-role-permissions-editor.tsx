"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PermissionChecklist } from "@/components/shared/permission-checklist";
import {
  useListPlatformPermissionsQuery,
  useReplacePlatformRolePermissionsMutation,
} from "@/features/platform-roles/api/platform-role.api";
import { normalizeApiError } from "@/lib/api-error";
import type { PlatformRole } from "@/types/platform-role";

interface PlatformRolePermissionsEditorProps {
  role: PlatformRole;
  onSaved?: () => void;
}

/**
 * Core editable checklist + Save button — Role Details page (inline) এবং list-page-এর
 * "Manage permissions" dialog দুটোই এই একই component reuse করে। শুধু ALLOW grant করে
 * (checked = ALLOW, unchecked = absent) — DENY effect exposed নয়, backend সমর্থন করলেও
 * এই UI-এর scope বাইরে (company-rbac-এর সাথে established convention)। SUPER_ADMIN role-এর
 * জন্য backend নিজেই সব permission বাধ্যতামূলক রাখে (verified) — client-side আলাদা guard নেই।
 */
export function PlatformRolePermissionsEditor({ role, onSaved }: PlatformRolePermissionsEditorProps) {
  const t = useTranslations("platformRoles");
  const { data: permissions } = useListPlatformPermissionsQuery();
  const [replacePermissions, { isLoading }] = useReplacePlatformRolePermissionsMutation();

  const [selected, setSelected] = useState<string[]>(() =>
    role.permissions.filter((p) => p.effect === "ALLOW").map((p) => p.permission.code),
  );

  async function handleSave() {
    if (selected.length === 0) {
      toast.error(t("form.permissionsRequired"));
      return;
    }

    const result = await replacePermissions({
      id: role.id,
      permissions: selected.map((code) => ({ code, effect: "ALLOW" as const })),
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("permissions.updateSuccess"));
    onSaved?.();
  }

  return (
    <div className="space-y-3">
      <PermissionChecklist permissions={permissions ?? []} value={selected} onChange={setSelected} />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("permissions.saveButton")}
        </Button>
      </div>
    </div>
  );
}
