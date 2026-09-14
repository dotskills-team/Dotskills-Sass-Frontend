"use client";

import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VariantAttribute } from "@/types/product-variant";

interface VariantAttributeSelectsProps {
  attributes: VariantAttribute[];
  /** attributeId -> selected valueId. An attribute with no selection yet is simply absent from this map. */
  selected: Record<string, string>;
  onChange: (attributeId: string, valueId: string) => void;
}

/**
 * One plain `<Select>` per company attribute (Size, Color, ...) — picks an
 * existing value per attribute rather than a chip-toggle widget, since
 * every caller (Add/Edit Variant forms) is selecting one value per
 * attribute for a single variant, which a `<Select>` already expresses
 * with zero new UI dependencies (this codebase has no Combobox/chip
 * component — see `product-search-input.tsx`'s own "hand-rolled, no new
 * dependency" precedent).
 */
export function VariantAttributeSelects({ attributes, selected, onChange }: VariantAttributeSelectsProps) {
  const t = useTranslations("products");

  if (attributes.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("variants.noAttributesYet")}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {attributes.map((attribute) => (
        <div key={attribute.id}>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{attribute.name}</label>
          <Select value={selected[attribute.id] ?? ""} onValueChange={(value) => onChange(attribute.id, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("variants.selectValuePlaceholder", { attribute: attribute.name })} />
            </SelectTrigger>
            <SelectContent>
              {attribute.values.map((value) => (
                <SelectItem key={value.id} value={value.id}>
                  {value.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
