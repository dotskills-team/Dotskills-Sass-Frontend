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
import { useAssignPlanFeatureMutation } from "@/features/plan-feature/api/plan-feature.api";
import {
  buildConfigDefaults,
  rowsToLimits,
  toAssignPlanFeaturePayload,
  type LimitRow,
} from "@/features/plan-feature/lib/plan-feature-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { Feature } from "@/types/platform";

interface AssignPlanFeatureDialogProps {
  planId: string;
  availableFeatures: Feature[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignPlanFeatureDialog({ planId, availableFeatures, open, onOpenChange }: AssignPlanFeatureDialogProps) {
  const t = useTranslations("planFeatures");
  const tCommon = useTranslations("common");
  const [assign, { isLoading }] = useAssignPlanFeatureMutation();

  const [featureId, setFeatureId] = useState("");
  const [enabled, setEnabled] = useState("true");
  const [rows, setRows] = useState<LimitRow[]>([]);
  const [configValues, setConfigValues] = useState<Record<string, unknown>>({});

  const selectedFeature = availableFeatures.find((feature) => feature.id === featureId);
  const configSchema = selectedFeature?.configSchema ?? null;

  function handleFeatureChange(nextFeatureId: string) {
    setFeatureId(nextFeatureId);
    const nextFeature = availableFeatures.find((feature) => feature.id === nextFeatureId);
    setConfigValues(nextFeature?.configSchema ? buildConfigDefaults(nextFeature.configSchema) : {});
    setRows([]);
  }

  function resetAndClose() {
    setFeatureId("");
    setEnabled("true");
    setRows([]);
    setConfigValues({});
    onOpenChange(false);
  }

  async function handleSubmit() {
    if (!featureId) {
      toast.error(t("form.featureRequired"));
      return;
    }

    const limits = configSchema ? configValues : rowsToLimits(rows);

    const result = await assign({
      planId,
      ...toAssignPlanFeaturePayload(featureId, enabled === "true", limits),
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.assignSuccess"));
    resetAndClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : resetAndClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.assignTitle")}</DialogTitle>
          <DialogDescription>{t("form.assignDescription")}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label>{t("form.featureFieldLabel")}</Label>
            <Select value={featureId} onValueChange={handleFeatureChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("form.featurePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {availableFeatures.map((feature) => (
                  <SelectItem key={feature.id} value={feature.id}>
                    {feature.name} ({feature.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          {featureId && (
            <div className="space-y-2">
              <Label>{t("form.limitsFieldLabel")}</Label>
              {configSchema && configSchema.length > 0 ? (
                <FeatureConfigForm schema={configSchema} values={configValues} onChange={setConfigValues} />
              ) : (
                <LimitsEditor rows={rows} onChange={setRows} />
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetAndClose} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tCommon("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
