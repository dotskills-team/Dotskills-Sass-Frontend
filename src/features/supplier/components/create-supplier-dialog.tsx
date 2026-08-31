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
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { SupplierForm } from "@/features/supplier/components/supplier-form";
import { useCreateSupplierMutation } from "@/features/supplier/api/supplier.api";
import { toSupplierPayload } from "@/features/supplier/lib/supplier-form-mapper";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { SupplierFormValues } from "@/features/supplier/schemas/supplier.schema";

const EMPTY_VALUES: SupplierFormValues = { name: "", phone: "", email: "", address: "" };

export function CreateSupplierDialog({ companyId }: { companyId: string }) {
  const t = useTranslations("suppliers");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createSupplier, { isLoading }] = useCreateSupplierMutation();

  async function handleSubmit(values: SupplierFormValues) {
    const result = await createSupplier({ companyId, body: toSupplierPayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUPPLIER_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <SupplierForm
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
