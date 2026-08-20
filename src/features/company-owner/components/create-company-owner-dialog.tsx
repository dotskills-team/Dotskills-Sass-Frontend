"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { CompanyOwnerForm } from "@/features/company-owner/components/company-owner-form";
import { useCreateCompanyOwnerMutation } from "@/features/company-owner/api/company-owner.api";
import { toCompanyOwnerCreatePayload } from "@/features/company-owner/lib/company-owner-form-mapper";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanyOwnerFormValues } from "@/features/company-owner/schemas/company-owner.schema";

const EMPTY_VALUES: CompanyOwnerFormValues = {
  email: "",
  fullName: "",
  phone: "",
  password: "",
  designation: "",
};

/**
 * `credentials.password` backend শুধু নতুন user create হলে একবারই return করে
 * (verified company-owner.service.ts — "SECURITY NOTE: Password is returned
 * only for newly created users") — তাই এটা re-fetch করা যায় না, dialog বন্ধ
 * করার আগে দেখানো জরুরি।
 */
export function CreateCompanyOwnerDialog({ companyId }: { companyId: string }) {
  const t = useTranslations("companyOwners");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(
    null,
  );
  const [createOwner, { isLoading }] = useCreateCompanyOwnerMutation();

  async function handleSubmit(values: CompanyOwnerFormValues) {
    const result = await createOwner({ companyId, body: toCompanyOwnerCreatePayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));

    if (result.data.data.credentials) {
      setCreatedCredentials(result.data.data.credentials);
    } else {
      setOpen(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCreatedCredentials(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.COMPANY_OWNER_CREATE}>
        <DialogTrigger asChild>
          <Button size="sm">
            <UserPlus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent>
        {createdCredentials ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("form.credentialsTitle")}</DialogTitle>
              <DialogDescription>{t("form.credentialsDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-md border border-border bg-muted/40 p-4 font-mono text-sm">
              <p>
                <span className="text-muted-foreground">{t("form.email")}: </span>
                {createdCredentials.email}
              </p>
              <p>
                <span className="text-muted-foreground">{t("form.password")}: </span>
                {createdCredentials.password}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>{tCommon("close")}</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("form.createTitle")}</DialogTitle>
              <DialogDescription>{t("form.createDescription")}</DialogDescription>
            </DialogHeader>
            <CompanyOwnerForm
              defaultValues={EMPTY_VALUES}
              isSubmitting={isLoading}
              submitLabel={tCommon("create")}
              cancelLabel={tCommon("cancel")}
              showPassword
              onCancel={() => handleOpenChange(false)}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
