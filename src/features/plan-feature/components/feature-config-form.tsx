"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FeatureConfigField } from "@/types/platform";

interface FeatureConfigFormProps {
  schema: FeatureConfigField[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

/**
 * Feature-এর `configSchema` অনুযায়ী human-friendly form render করে — admin কোনো
 * `string`/`number`/`boolean`/JSON বা raw key দেখে না, শুধু label/description-সহ
 * proper input control (Number, Yes/No, Text, Select, Multi-select)।
 */
export function FeatureConfigForm({ schema, values, onChange }: FeatureConfigFormProps) {
  const t = useTranslations("planFeatures");

  function setValue(key: string, value: unknown) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-4">
      {schema.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={`config-${field.key}`}>
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </Label>

          {field.type === "NUMBER" && (
            <Input
              id={`config-${field.key}`}
              type="number"
              min={field.min}
              max={field.max}
              value={typeof values[field.key] === "number" ? String(values[field.key]) : ""}
              onChange={(event) =>
                setValue(field.key, event.target.value === "" ? undefined : Number(event.target.value))
              }
            />
          )}

          {field.type === "BOOLEAN" && (
            <Select
              value={values[field.key] === true ? "true" : values[field.key] === false ? "false" : ""}
              onValueChange={(value) => setValue(field.key, value === "true")}
            >
              <SelectTrigger id={`config-${field.key}`} className="w-full">
                <SelectValue placeholder={t("form.selectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{t("form.yes")}</SelectItem>
                <SelectItem value="false">{t("form.no")}</SelectItem>
              </SelectContent>
            </Select>
          )}

          {field.type === "STRING" && (
            <Input
              id={`config-${field.key}`}
              value={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
              onChange={(event) => setValue(field.key, event.target.value)}
            />
          )}

          {field.type === "SELECT" && (
            <Select
              value={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
              onValueChange={(value) => setValue(field.key, value)}
            >
              <SelectTrigger id={`config-${field.key}`} className="w-full">
                <SelectValue placeholder={t("form.selectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "MULTI_SELECT" && (
            <div className="space-y-2 rounded-md border border-border p-3">
              {(field.options ?? []).map((option) => {
                const selected = Array.isArray(values[field.key]) ? (values[field.key] as string[]) : [];
                const checked = selected.includes(option.value);
                return (
                  <label key={option.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        setValue(
                          field.key,
                          next ? [...selected, option.value] : selected.filter((v) => v !== option.value),
                        )
                      }
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          )}

          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
        </div>
      ))}
    </div>
  );
}
