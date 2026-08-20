"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { useBootstrapCompanyRbacMutation } from "@/features/company-rbac/api/company-rbac.api";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";

/**
 * `POST platform/companies/:companyId/rbac/bootstrap` — company-এর 4টা system role
 * (COMPANY_OWNER/COMPANY_ADMIN/MANAGER/STAFF) upsert করে, ঐচ্ছিকভাবে owner activate/promote
 * করে (verified company-rbac.controller.ts + service — hardcoded `DEFAULT_ROLES`)। Platform
 * admin একটা company-র RBAC প্রথমবার set up করতে এটা ব্যবহার করে, তারপর company নিজে থেকে
 * roles/members manage করে ((company)/company/rbac/* route)।
 */
export function BootstrapCompanyRbacDialog({ companyId }: { companyId: string }) {
  const t = useTranslations("companyRbac");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [bootstrap, { isLoading }] = useBootstrapCompanyRbacMutation();

  async function handleSubmit() {
    const result = await bootstrap({ companyId, ownerEmail: ownerEmail.trim() || undefined });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("bootstrap.success"));
    setOpen(false);
    setOwnerEmail("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_RBAC_BOOTSTRAP}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <ShieldCheck aria-hidden="true" />
            {t("bootstrap.trigger")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("bootstrap.title")}</DialogTitle>
          <DialogDescription>{t("bootstrap.description")}</DialogDescription>
        </DialogHeader>

        <div>
          <Label className="mb-2">{t("bootstrap.ownerEmail")}</Label>
          <Input
            type="email"
            value={ownerEmail}
            onChange={(event) => setOwnerEmail(event.target.value)}
            placeholder={t("bootstrap.ownerEmailPlaceholder")}
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("bootstrap.ownerEmailDescription")}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("bootstrap.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
