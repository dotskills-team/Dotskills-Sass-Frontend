"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { VariantAttributeSelects } from "@/features/variant-attribute/components/variant-attribute-selects";
import type { VariantAttribute } from "@/types/product-variant";

export interface VariantDraft {
  sku: string;
  barcode: string;
  costPrice: string;
  salePrice: string;
  attributeValues: Record<string, string>;
}

interface VariantFormFieldsProps {
  attributes: VariantAttribute[];
  draft: VariantDraft;
  onChange: (draft: VariantDraft) => void;
  isSkuEditable: boolean;
}

/** Shared field set for both "Add Variant" and "Edit Variant" — a variant is its own small resource (SKU, cost, price, one value per attribute), not worth two near-duplicate forms. */
export function VariantFormFields({ attributes, draft, onChange, isSkuEditable }: VariantFormFieldsProps) {
  const t = useTranslations("products");

  return (
    <div className="space-y-3">
      <VariantAttributeSelects
        attributes={attributes}
        selected={draft.attributeValues}
        onChange={(attributeId, valueId) =>
          onChange({ ...draft, attributeValues: { ...draft.attributeValues, [attributeId]: valueId } })
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("variants.sku")}</label>
          <Input
            value={draft.sku}
            onChange={(e) => onChange({ ...draft, sku: e.target.value })}
            disabled={!isSkuEditable}
            placeholder={t("variants.skuPlaceholder")}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("form.barcode")}</label>
          <Input value={draft.barcode} onChange={(e) => onChange({ ...draft, barcode: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("form.costPrice")}</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={draft.costPrice}
            onChange={(e) => onChange({ ...draft, costPrice: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("form.salePrice")}</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={draft.salePrice}
            onChange={(e) => onChange({ ...draft, salePrice: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export const EMPTY_VARIANT_DRAFT: VariantDraft = {
  sku: "",
  barcode: "",
  costPrice: "",
  salePrice: "",
  attributeValues: {},
};
