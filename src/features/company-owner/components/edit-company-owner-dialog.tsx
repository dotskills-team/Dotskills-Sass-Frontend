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
import { CompanyOwnerForm } from "@/features/company-owner/components/company-owner-form";
import { useUpdateCompanyOwnerMutation } from "@/features/company-owner/api/company-owner.api";
import { toCompanyOwnerUpdatePayload } from "@/features/company-owner/lib/company-owner-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanyOwnerFormValues } from "@/features/company-owner/schemas/company-owner.schema";
import type { CompanyOwnership } from "@/types/company-owner";

interface EditCompanyOwnerDialogProps {
  companyId: string;
  ownership: CompanyOwnership;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Edit flow — Industry/Tenant/Company-এর controlled `open`/`onOpenChange` pattern reuse। */
export function EditCompanyOwnerDialog({ companyId, ownership, open, onOpenChange }: EditCompanyOwnerDialogProps) {
  const t = useTranslations("companyOwners");
  const tCommon = useTranslations("common");
  const [updateOwner, { isLoading }] = useUpdateCompanyOwnerMutation();

  async function handleSubmit(values: CompanyOwnerFormValues) {
    const result = await updateOwner({
      companyId,
      ownerMemberId: ownership.companyMemberId,
      body: toCompanyOwnerUpdatePayload(values),
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.editSuccess"));
    onOpenChange(false);
  }

  const user = ownership.companyMember.user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.editTitle")}</DialogTitle>
          <DialogDescription>{t("form.editDescription", { name: user.fullName })}</DialogDescription>
        </DialogHeader>
        <CompanyOwnerForm
          defaultValues={{
            email: user.email,
            fullName: user.fullName,
            phone: user.phone ?? "",
            password: "",
            designation: ownership.companyMember.designation ?? "",
          }}
          isSubmitting={isLoading}
          submitLabel={tCommon("update")}
          cancelLabel={tCommon("cancel")}
          showPassword={false}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
