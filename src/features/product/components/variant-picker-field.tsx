"use client";

import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListProductVariantsQuery } from "@/features/product/api/product-variant.api";
import { formatVariantLabel } from "@/features/product/lib/format-variant-label";
import type { Product } from "@/types/product";

interface VariantPickerFieldProps {
  companyId: string;
  product: Product | undefined;
  value: string;
  onChange: (variantId: string) => void;
}

/**
 * Renders nothing for a plain product — only a `hasVariants` product needs
 * this second selection step. Used identically in Purchase Order and
 * Stock Transfer line-item forms (both insert this right after their
 * existing plain productId `<Select>`), and picks from the real list of
 * variants (same reasoning as POS's `VariantSelectDialog`: never lets a
 * non-existent attribute combination be selected).
 */
export function VariantPickerField({ companyId, product, value, onChange }: VariantPickerFieldProps) {
  const t = useTranslations("products");

  const { data: variants } = useListProductVariantsQuery(
    { companyId, productId: product?.id ?? "" },
    { skip: !product?.hasVariants },
  );

  if (!product?.hasVariants) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("variants.selectVariantPlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        {(variants ?? []).map((variant) => (
          <SelectItem key={variant.id} value={variant.id}>
            {formatVariantLabel(variant)} ({variant.sku})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
