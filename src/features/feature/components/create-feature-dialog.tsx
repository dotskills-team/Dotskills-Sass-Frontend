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
import { FeatureForm } from "@/features/feature/components/feature-form";
import { useCreateFeatureMutation } from "@/features/feature/api/feature.api";
import { toFeaturePayload } from "@/features/feature/lib/feature-form-mapper";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { FeatureFormValues } from "@/features/feature/schemas/feature.schema";

const EMPTY_VALUES: FeatureFormValues = { name: "", code: "", module: "", description: "" };

export function CreateFeatureDialog() {
  const t = useTranslations("features");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createFeature, { isLoading }] = useCreateFeatureMutation();

  async function handleSubmit(values: FeatureFormValues) {
    const result = await createFeature(toFeaturePayload(values));

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.FEATURE_CREATE}>
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
        <FeatureForm
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
