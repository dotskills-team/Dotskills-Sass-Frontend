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
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { UnitForm } from "@/features/unit/components/unit-form";
import { useCreateUnitMutation } from "@/features/unit/api/unit.api";
import { toUnitPayload } from "@/features/unit/lib/unit-form-mapper";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { UnitFormValues } from "@/features/unit/schemas/unit.schema";
import type { Unit } from "@/types/unit";

const EMPTY_VALUES: UnitFormValues = { name: "", code: "", baseUnitId: "", conversionFactor: "" };

export function CreateUnitDialog({ companyId, units }: { companyId: string; units: Unit[] }) {
  const t = useTranslations("units");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createUnit, { isLoading }] = useCreateUnitMutation();

  async function handleSubmit(values: UnitFormValues) {
    const result = await createUnit({ companyId, body: toUnitPayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.UNIT_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <UnitForm
          defaultValues={EMPTY_VALUES}
          candidateBaseUnits={units}
          isCodeEditable
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
