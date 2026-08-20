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
import { IndustryForm } from "@/features/industry/components/industry-form";
import { useCreateIndustryMutation } from "@/features/industry/api/industry.api";
import { toIndustryPayload } from "@/features/industry/lib/industry-form-mapper";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { IndustryFormValues } from "@/features/industry/schemas/industry.schema";

const EMPTY_VALUES: IndustryFormValues = { code: "", name: "", description: "" };

/** Create flow — Industry দিয়ে established pattern, Plan/Company/Tenant-এও reuse হবে। */
export function CreateIndustryDialog() {
  const t = useTranslations("industries");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createIndustry, { isLoading }] = useCreateIndustryMutation();

  async function handleSubmit(values: IndustryFormValues) {
    const result = await createIndustry(toIndustryPayload(values));

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INDUSTRY_CREATE}>
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
        <IndustryForm
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
