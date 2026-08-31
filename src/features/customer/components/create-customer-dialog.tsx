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
import { CustomerForm } from "@/features/customer/components/customer-form";
import { useCreateCustomerMutation } from "@/features/customer/api/customer.api";
import { toCustomerPayload } from "@/features/customer/lib/customer-form-mapper";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { CustomerFormValues } from "@/features/customer/schemas/customer.schema";

const EMPTY_VALUES: CustomerFormValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  customerType: "RETAIL",
};

export function CreateCustomerDialog({ companyId }: { companyId: string }) {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  async function handleSubmit(values: CustomerFormValues) {
    const result = await createCustomer({ companyId, body: toCustomerPayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CUSTOMER_CREATE}>
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
        <CustomerForm
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
