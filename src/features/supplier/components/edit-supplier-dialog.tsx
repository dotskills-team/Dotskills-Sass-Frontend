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
import { SupplierForm } from "@/features/supplier/components/supplier-form";
import { useUpdateSupplierMutation } from "@/features/supplier/api/supplier.api";
import { toSupplierPayload } from "@/features/supplier/lib/supplier-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { SupplierFormValues } from "@/features/supplier/schemas/supplier.schema";
import type { Supplier } from "@/types/supplier";

interface EditSupplierDialogProps {
  companyId: string;
  supplier: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSupplierDialog({ companyId, supplier, open, onOpenChange }: EditSupplierDialogProps) {
  const t = useTranslations("suppliers");
  const tCommon = useTranslations("common");
  const [updateSupplier, { isLoading }] = useUpdateSupplierMutation();

  async function handleSubmit(values: SupplierFormValues) {
    const result = await updateSupplier({ companyId, id: supplier.id, body: toSupplierPayload(values) });

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
          <DialogDescription>{t("form.editDescription", { name: supplier.name })}</DialogDescription>
        </DialogHeader>
        <SupplierForm
          defaultValues={{
            name: supplier.name,
            phone: supplier.phone ?? "",
            email: supplier.email ?? "",
            address: supplier.address ?? "",
          }}
          isSubmitting={isLoading}
          submitLabel={tCommon("update")}
          cancelLabel={tCommon("cancel")}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
