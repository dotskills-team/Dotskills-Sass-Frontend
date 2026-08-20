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
import { PlanForm } from "@/features/plan/components/plan-form";
import { useUpdatePlanMutation } from "@/features/plan/api/plan.api";
import { toPlanPayload } from "@/features/plan/lib/plan-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { PlanFormValues } from "@/features/plan/schemas/plan.schema";
import type { Plan } from "@/types/platform";

interface EditPlanDialogProps {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** সব field (code/name/description/trialDays/isPublic) backend-এ editable (UpdatePlanDto, verified) — কোনো field আলাদা করে lock করার দরকার নেই। */
export function EditPlanDialog({ plan, open, onOpenChange }: EditPlanDialogProps) {
  const t = useTranslations("plans");
  const tCommon = useTranslations("common");
  const [updatePlan, { isLoading }] = useUpdatePlanMutation();

  async function handleSubmit(values: PlanFormValues) {
    const result = await updatePlan({ id: plan.id, ...toPlanPayload(values) });

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
          <DialogDescription>{t("form.editDescription", { name: plan.name })}</DialogDescription>
        </DialogHeader>
        <PlanForm
          defaultValues={{
            code: plan.code,
            name: plan.name,
            description: plan.description ?? "",
            trialDays: String(plan.trialDays),
            isPublic: plan.isPublic ? "true" : "false",
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
