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
import { IndustryForm } from "@/features/industry/components/industry-form";
import { useUpdateIndustryMutation } from "@/features/industry/api/industry.api";
import { toIndustryPayload } from "@/features/industry/lib/industry-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { IndustryFormValues } from "@/features/industry/schemas/industry.schema";
import type { Industry } from "@/types/platform";

interface EditIndustryDialogProps {
  industry: Industry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Edit flow — kebab menu-এর "Edit" item থেকে খোলে (industry-actions.tsx-এর
 * অন্যান্য ActionConfirmDialog-এর মতোই controlled `open`/`onOpenChange`
 * pattern), existing backend data দিয়ে form pre-populate করে।
 */
export function EditIndustryDialog({ industry, open, onOpenChange }: EditIndustryDialogProps) {
  const t = useTranslations("industries");
  const tCommon = useTranslations("common");
  const [updateIndustry, { isLoading }] = useUpdateIndustryMutation();

  async function handleSubmit(values: IndustryFormValues) {
    const result = await updateIndustry({ id: industry.id, ...toIndustryPayload(values) });

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
          <DialogDescription>{t("form.editDescription", { name: industry.name })}</DialogDescription>
        </DialogHeader>
        <IndustryForm
          defaultValues={{
            code: industry.code,
            name: industry.name,
            description: industry.description ?? "",
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
