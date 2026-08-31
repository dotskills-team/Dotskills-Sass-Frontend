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
import { CustomerForm } from "@/features/customer/components/customer-form";
import { useUpdateCustomerMutation } from "@/features/customer/api/customer.api";
import { toCustomerPayload } from "@/features/customer/lib/customer-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { CustomerFormValues } from "@/features/customer/schemas/customer.schema";
import type { Customer } from "@/types/customer";

interface EditCustomerDialogProps {
  companyId: string;
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomerDialog({ companyId, customer, open, onOpenChange }: EditCustomerDialogProps) {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const [updateCustomer, { isLoading }] = useUpdateCustomerMutation();

  async function handleSubmit(values: CustomerFormValues) {
    const result = await updateCustomer({ companyId, id: customer.id, body: toCustomerPayload(values) });

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
          <DialogDescription>{t("form.editDescription", { name: customer.name })}</DialogDescription>
        </DialogHeader>
        <CustomerForm
          defaultValues={{
            name: customer.name,
            phone: customer.phone ?? "",
            email: customer.email ?? "",
            address: customer.address ?? "",
            customerType: customer.customerType,
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
