"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FeatureConfigField, FeatureConfigFieldOption, FeatureConfigFieldType } from "@/types/platform";

interface FeatureConfigSchemaEditorProps {
  fields: FeatureConfigField[];
  onChange: (fields: FeatureConfigField[]) => void;
}

const FIELD_TYPES: FeatureConfigFieldType[] = ["NUMBER", "BOOLEAN", "STRING", "SELECT", "MULTI_SELECT"];
const CHOICE_TYPES: FeatureConfigFieldType[] = ["SELECT", "MULTI_SELECT"];

/**
 * Feature-এর configuration definition তৈরি করার builder — এখানে যা define হয়
 * (verified `Feature.configSchema`, `feature-config-field.dto.ts`) সেটাই পরে
 * Plan → Features → Assign/Edit-এ `FeatureConfigForm` human-friendly form হিসেবে
 * render করে। এই editor নিজেই এখনো technical (Feature-এর owner এটা define করে),
 * কিন্তু Plan Feature-এর admin (assign/edit করা ব্যক্তি) শুধু resulting form দেখে।
 */
export function FeatureConfigSchemaEditor({ fields, onChange }: FeatureConfigSchemaEditorProps) {
  const t = useTranslations("features");

  function updateField(index: number, patch: Partial<FeatureConfigField>) {
    onChange(fields.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function addField() {
    onChange([...fields, { key: "", label: "", type: "STRING" }]);
  }

  function updateOptions(index: number, options: FeatureConfigFieldOption[]) {
    updateField(index, { options });
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={index} className="space-y-3 rounded-md border border-border p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                placeholder={t("configSchema.keyPlaceholder")}
                value={field.key}
                onChange={(event) => updateField(index, { key: event.target.value })}
              />
              <Input
                placeholder={t("configSchema.labelPlaceholder")}
                value={field.label}
                onChange={(event) => updateField(index, { label: event.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeField(index)}
              aria-label={t("configSchema.removeField")}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <Input
            placeholder={t("configSchema.descriptionPlaceholder")}
            value={field.description ?? ""}
            onChange={(event) => updateField(index, { description: event.target.value || undefined })}
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("configSchema.type")}</Label>
              <Select
                value={field.type}
                onValueChange={(value) =>
                  updateField(index, {
                    type: value as FeatureConfigFieldType,
                    options: CHOICE_TYPES.includes(value as FeatureConfigFieldType) ? (field.options ?? []) : undefined,
                    min: value === "NUMBER" ? field.min : undefined,
                    max: value === "NUMBER" ? field.max : undefined,
                    defaultValue: undefined,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`configSchema.fieldTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t("configSchema.required")}</Label>
              <Select
                value={field.required ? "true" : "false"}
                onValueChange={(value) => updateField(index, { required: value === "true" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t("configSchema.requiredYes")}</SelectItem>
                  <SelectItem value="false">{t("configSchema.requiredNo")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {field.type === "NUMBER" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                type="number"
                placeholder={t("configSchema.defaultValue")}
                value={typeof field.defaultValue === "number" ? String(field.defaultValue) : ""}
                onChange={(event) =>
                  updateField(index, {
                    defaultValue: event.target.value === "" ? undefined : Number(event.target.value),
                  })
                }
              />
              <Input
                type="number"
                placeholder={t("configSchema.min")}
                value={field.min ?? ""}
                onChange={(event) =>
                  updateField(index, { min: event.target.value === "" ? undefined : Number(event.target.value) })
                }
              />
              <Input
                type="number"
                placeholder={t("configSchema.max")}
                value={field.max ?? ""}
                onChange={(event) =>
                  updateField(index, { max: event.target.value === "" ? undefined : Number(event.target.value) })
                }
              />
            </div>
          )}

          {field.type === "BOOLEAN" && (
            <Select
              value={field.defaultValue === true ? "true" : field.defaultValue === false ? "false" : "__unset"}
              onValueChange={(value) => updateField(index, { defaultValue: value === "__unset" ? undefined : value === "true" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("configSchema.defaultValue")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__unset">{t("configSchema.noDefault")}</SelectItem>
                <SelectItem value="true">{t("configSchema.requiredYes")}</SelectItem>
                <SelectItem value="false">{t("configSchema.requiredNo")}</SelectItem>
              </SelectContent>
            </Select>
          )}

          {field.type === "STRING" && (
            <Input
              placeholder={t("configSchema.defaultValue")}
              value={typeof field.defaultValue === "string" ? field.defaultValue : ""}
              onChange={(event) => updateField(index, { defaultValue: event.target.value || undefined })}
            />
          )}

          {CHOICE_TYPES.includes(field.type) && (
            <OptionsEditor
              options={field.options ?? []}
              onChange={(options) => updateOptions(index, options)}
              labels={{
                valuePlaceholder: t("configSchema.optionValuePlaceholder"),
                labelPlaceholder: t("configSchema.optionLabelPlaceholder"),
                addOption: t("configSchema.addOption"),
                removeOption: t("configSchema.removeOption"),
              }}
            />
          )}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addField}>
        <Plus aria-hidden="true" />
        {t("configSchema.addField")}
      </Button>
    </div>
  );
}

interface OptionsEditorProps {
  options: FeatureConfigFieldOption[];
  onChange: (options: FeatureConfigFieldOption[]) => void;
  labels: {
    valuePlaceholder: string;
    labelPlaceholder: string;
    addOption: string;
    removeOption: string;
  };
}

function OptionsEditor({ options, onChange, labels }: OptionsEditorProps) {
  function updateOption(index: number, patch: Partial<FeatureConfigFieldOption>) {
    onChange(options.map((option, i) => (i === index ? { ...option, ...patch } : option)));
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder={labels.valuePlaceholder}
            value={option.value}
            onChange={(event) => updateOption(index, { value: event.target.value })}
          />
          <Input
            className="flex-1"
            placeholder={labels.labelPlaceholder}
            value={option.label}
            onChange={(event) => updateOption(index, { label: event.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => removeOption(index)}
            aria-label={labels.removeOption}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...options, { value: "", label: "" }])}>
        <Plus aria-hidden="true" />
        {labels.addOption}
      </Button>
    </div>
  );
}
