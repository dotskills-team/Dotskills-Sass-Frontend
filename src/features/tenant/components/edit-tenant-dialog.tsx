"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TenantForm } from "@/features/tenant/components/tenant-form";
import { useUpdateTenantMutation } from "@/features/tenant/api/tenant.api";
import { toTenantUpdatePayload } from "@/features/tenant/lib/tenant-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { TenantFormValues } from "@/features/tenant/schemas/tenant.schema";
import type { Tenant } from "@/types/platform";

interface EditTenantDialogProps {
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Edit flow — kebab menu "Edit" থেকে খোলে, Industry-এর controlled `open`/`onOpenChange` pattern। */
export function EditTenantDialog({ tenant, open, onOpenChange }: EditTenantDialogProps) {
  const t = useTranslations("tenants");
  const tCommon = useTranslations("common");
  const [updateTenant, { isLoading }] = useUpdateTenantMutation();

  async function handleSubmit(values: TenantFormValues) {
    const result = await updateTenant({ id: tenant.id, ...toTenantUpdatePayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
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
          <DialogDescription>{t("form.editDescription", { name: tenant.name })}</DialogDescription>
        </DialogHeader>
        <TenantForm
          defaultValues={{ code: tenant.code, name: tenant.name, slug: tenant.slug }}
          isSubmitting={isLoading}
          submitLabel={tCommon("update")}
          cancelLabel={tCommon("cancel")}
          codeReadOnly
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
