"use client";

import { useTranslations } from "next-intl";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { useSyncPermissionCatalogMutation } from "@/features/platform-roles/api/platform-role.api";
import { normalizeApiError } from "@/lib/api-error";

/**
 * `POST /platform/access-control/setup`-এর কোনো `@RequirePlatformPermissions` decorator নেই —
 * backend service নিজেই `actor.roles.includes('SUPER_ADMIN')` check করে (verified)। তাই এখানে
 * কোনো permission code invent না করে সেই একই role check mirror করা হয়েছে — SUPER_ADMIN ছাড়া
 * অন্য কারো কাছে button-ই দেখা যায় না, এবং backend নিজেও শেষ authority হিসেবে থাকে
 * (frontend gate bypass হলেও backend 403 দেবে)।
 */
export function SyncPermissionCatalogButton() {
  const t = useTranslations("platformRoles");
  const user = useAppSelector((state) => state.auth.user);
  const [syncCatalog, { isLoading }] = useSyncPermissionCatalogMutation();

  const isSuperAdmin = !!user?.roles.includes("SUPER_ADMIN");

  if (!isSuperAdmin) return null;

  async function handleSync() {
    const result = await syncCatalog();

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(
      t("syncCatalog.success", {
        count: result.data.data.permissionsUpserted,
        roles: result.data.data.mappedRoles.join(", "),
      }),
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSync} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw className="size-4" aria-hidden="true" />
      )}
      {t("syncCatalog.trigger")}
    </Button>
  );
}
