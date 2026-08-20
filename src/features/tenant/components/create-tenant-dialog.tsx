"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
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
import { TenantForm } from "@/features/tenant/components/tenant-form";
import { useCreateTenantMutation } from "@/features/tenant/api/tenant.api";
import { toTenantCreatePayload } from "@/features/tenant/lib/tenant-form-mapper";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { TenantFormValues } from "@/features/tenant/schemas/tenant.schema";

const EMPTY_VALUES: TenantFormValues = { code: "", name: "", slug: "" };

/** Create flow — Industry-এর established pattern reuse। */
export function CreateTenantDialog() {
  const t = useTranslations("tenants");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createTenant, { isLoading }] = useCreateTenantMutation();

  async function handleSubmit(values: TenantFormValues) {
    const result = await createTenant(toTenantCreatePayload(values));

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.TENANT_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <TenantForm
          defaultValues={EMPTY_VALUES}
          isSubmitting={isLoading}
          submitLabel={tCommon("create")}
          cancelLabel={tCommon("cancel")}
          onCancel={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
