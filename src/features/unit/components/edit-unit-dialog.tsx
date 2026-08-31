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
import { UnitForm } from "@/features/unit/components/unit-form";
import { useUpdateUnitMutation } from "@/features/unit/api/unit.api";
import { toUnitPayload } from "@/features/unit/lib/unit-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { UnitFormValues } from "@/features/unit/schemas/unit.schema";
import type { Unit } from "@/types/unit";

interface EditUnitDialogProps {
  companyId: string;
  unit: Unit;
  units: Unit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUnitDialog({ companyId, unit, units, open, onOpenChange }: EditUnitDialogProps) {
  const t = useTranslations("units");
  const tCommon = useTranslations("common");
  const [updateUnit, { isLoading }] = useUpdateUnitMutation();

  async function handleSubmit(values: UnitFormValues) {
    const payload = toUnitPayload(values);
    const result = await updateUnit({
      companyId,
      id: unit.id,
      body: { name: payload.name, baseUnitId: payload.baseUnitId, conversionFactor: payload.conversionFactor },
    });

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
          <DialogDescription>{t("form.editDescription", { name: unit.name })}</DialogDescription>
        </DialogHeader>
        <UnitForm
          defaultValues={{
            name: unit.name,
            code: unit.code,
            baseUnitId: unit.baseUnitId ?? "",
            conversionFactor: unit.conversionFactor,
          }}
          candidateBaseUnits={units.filter((candidate) => candidate.id !== unit.id)}
          isCodeEditable={false}
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
