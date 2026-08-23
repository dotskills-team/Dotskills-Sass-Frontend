"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LimitRow, LimitValueType } from "@/features/plan-feature/lib/plan-feature-form-mapper";

const LIMIT_TYPES: LimitValueType[] = ["string", "number", "boolean"];

interface LimitsEditorProps {
  rows: LimitRow[];
  onChange: (rows: LimitRow[]) => void;
}

/**
 * Backend `limits`-এর কোনো fixed schema নেই (verified — `Record<string, unknown>`, শুধু
 * `@IsObject()`), তাই এটা একটা generic, safe key/type/value row editor — কোনো নির্দিষ্ট
 * field invent করা হয়নি। Company RBAC-এর `AssignMemberScopesDialog`-এর dynamic array-editor
 * pattern reuse করা হয়েছে।
 */
export function LimitsEditor({ rows, onChange }: LimitsEditorProps) {
  const t = useTranslations("planFeatures");

  function updateRow(index: number, patch: Partial<LimitRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, { key: "", type: "string", value: "" }]);
  }

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder={t("form.limitKeyPlaceholder")}
            value={row.key}
            onChange={(event) => updateRow(index, { key: event.target.value })}
          />
          <Select
            value={row.type}
            onValueChange={(value) =>
              updateRow(index, { type: value as LimitValueType, value: value === "boolean" ? "true" : row.value })
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {row.type === "boolean" ? (
            <Select value={row.value || "true"} onValueChange={(value) => updateRow(index, { value })}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">true</SelectItem>
                <SelectItem value="false">false</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              className="flex-1"
              type={row.type === "number" ? "number" : "text"}
              placeholder={t("form.limitValuePlaceholder")}
              value={row.value}
              onChange={(event) => updateRow(index, { value: event.target.value })}
            />
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => removeRow(index)}
            aria-label={t("form.limitRemove")}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus aria-hidden="true" />
        {t("form.addLimit")}
      </Button>
    </div>
  );
}
