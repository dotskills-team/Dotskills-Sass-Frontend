"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LimitsEditor } from "@/features/plan-feature/components/limits-editor";
import { FeatureConfigForm } from "@/features/plan-feature/components/feature-config-form";
import { useUpdatePlanFeatureMutation } from "@/features/plan-feature/api/plan-feature.api";
import {
  limitsToConfigValues,
  limitsToRows,
  rowsToLimits,
  toUpdatePlanFeaturePayload,
  type LimitRow,
} from "@/features/plan-feature/lib/plan-feature-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { PlanFeatureAssignment } from "@/types/platform";

interface EditPlanFeatureDialogProps {
  planId: string;
  assignment: PlanFeatureAssignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlanFeatureDialog({ planId, assignment, open, onOpenChange }: EditPlanFeatureDialogProps) {
  const t = useTranslations("planFeatures");
  const tCommon = useTranslations("common");
  const [update, { isLoading }] = useUpdatePlanFeatureMutation();

  const configSchema = assignment.feature.configSchema;

  const [enabled, setEnabled] = useState(assignment.enabled ? "true" : "false");
  const [rows, setRows] = useState<LimitRow[]>(() => (configSchema ? [] : limitsToRows(assignment.limits)));
  const [configValues, setConfigValues] = useState<Record<string, unknown>>(() =>
    configSchema ? limitsToConfigValues(configSchema, assignment.limits) : {},
  );

  async function handleSubmit() {
    const limits = configSchema ? configValues : rowsToLimits(rows);

    const result = await update({
      planId,
      featureId: assignment.featureId,
      ...toUpdatePlanFeaturePayload(enabled === "true", limits),
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
          <DialogDescription>{t("form.editDescription", { name: assignment.feature.name })}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label>{t("form.enabledFieldLabel")}</Label>
            <Select value={enabled} onValueChange={setEnabled}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{t("enabled")}</SelectItem>
                <SelectItem value="false">{t("disabled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("form.limitsFieldLabel")}</Label>
            {configSchema && configSchema.length > 0 ? (
              <FeatureConfigForm schema={configSchema} values={configValues} onChange={setConfigValues} />
            ) : (
              <LimitsEditor rows={rows} onChange={setRows} />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tCommon("update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
