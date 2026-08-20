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
import { FeatureForm } from "@/features/feature/components/feature-form";
import { useUpdateFeatureMutation } from "@/features/feature/api/feature.api";
import { toFeaturePayload } from "@/features/feature/lib/feature-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { FeatureFormValues } from "@/features/feature/schemas/feature.schema";
import type { Feature } from "@/types/platform";

interface EditFeatureDialogProps {
  feature: Feature;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFeatureDialog({ feature, open, onOpenChange }: EditFeatureDialogProps) {
  const t = useTranslations("features");
  const tCommon = useTranslations("common");
  const [updateFeature, { isLoading }] = useUpdateFeatureMutation();

  async function handleSubmit(values: FeatureFormValues) {
    const result = await updateFeature({ id: feature.id, ...toFeaturePayload(values) });

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
          <DialogDescription>{t("form.editDescription", { name: feature.name })}</DialogDescription>
        </DialogHeader>
        <FeatureForm
          defaultValues={{
            name: feature.name,
            code: feature.code,
            module: feature.module,
            description: feature.description ?? "",
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
