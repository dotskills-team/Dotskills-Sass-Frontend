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
import { CompanyForm } from "@/features/company/components/company-form";
import { useCreateCompanyMutation } from "@/features/company/api/company.api";
import { toCompanyCreatePayload } from "@/features/company/lib/company-form-mapper";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanyFormValues } from "@/features/company/schemas/company.schema";

const EMPTY_VALUES: CompanyFormValues = {
  tenantId: "",
  industryId: "",
  code: "",
  legalName: "",
  tradeName: "",
  email: "",
  phone: "",
  taxId: "",
  registrationNo: "",
  baseCurrencyCode: "",
  timezone: "",
};

/** Create flow — Industry/Tenant-এর established pattern reuse। */
export function CreateCompanyDialog() {
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createCompany, { isLoading }] = useCreateCompanyMutation();

  async function handleSubmit(values: CompanyFormValues) {
    const result = await createCompany(toCompanyCreatePayload(values));

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <CompanyForm
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
