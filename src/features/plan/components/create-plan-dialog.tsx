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
import { PlanForm } from "@/features/plan/components/plan-form";
import { useCreatePlanMutation } from "@/features/plan/api/plan.api";
import { toPlanPayload } from "@/features/plan/lib/plan-form-mapper";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { PlanFormValues } from "@/features/plan/schemas/plan.schema";

const EMPTY_VALUES: PlanFormValues = {
  code: "",
  name: "",
  description: "",
  trialDays: "0",
  isPublic: "true",
};

export function CreatePlanDialog() {
  const t = useTranslations("plans");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createPlan, { isLoading }] = useCreatePlanMutation();

  async function handleSubmit(values: PlanFormValues) {
    const result = await createPlan(toPlanPayload(values));

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_CREATE}>
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
        <PlanForm
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
