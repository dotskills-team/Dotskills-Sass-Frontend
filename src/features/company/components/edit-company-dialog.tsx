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
import { CompanyForm } from "@/features/company/components/company-form";
import { useUpdateCompanyMutation } from "@/features/company/api/company.api";
import { toCompanyUpdatePayload } from "@/features/company/lib/company-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanyFormValues } from "@/features/company/schemas/company.schema";
import type { Company } from "@/types/platform";

interface EditCompanyDialogProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Edit flow — Industry/Tenant-এর controlled `open`/`onOpenChange` pattern reuse। */
export function EditCompanyDialog({ company, open, onOpenChange }: EditCompanyDialogProps) {
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");
  const [updateCompany, { isLoading }] = useUpdateCompanyMutation();

  async function handleSubmit(values: CompanyFormValues) {
    const result = await updateCompany({ id: company.id, ...toCompanyUpdatePayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.editSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("form.editTitle")}</DialogTitle>
          <DialogDescription>
            {t("form.editDescription", { name: company.tradeName || company.legalName })}
          </DialogDescription>
        </DialogHeader>
        <CompanyForm
          defaultValues={{
            tenantId: company.tenantId,
            industryId: company.industryId,
            code: company.code,
            legalName: company.legalName,
            tradeName: company.tradeName ?? "",
            email: company.email ?? "",
            phone: company.phone ?? "",
            taxId: company.taxId ?? "",
            registrationNo: company.registrationNo ?? "",
            baseCurrencyCode: company.baseCurrencyCode ?? "",
            timezone: company.timezone ?? "",
          }}
          isSubmitting={isLoading}
          submitLabel={tCommon("update")}
          cancelLabel={tCommon("cancel")}
          tenantReadOnly
          codeReadOnly
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
