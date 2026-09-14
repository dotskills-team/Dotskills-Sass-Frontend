import type { ProductVariant, ProductVariantAttributeValue } from "@/types/product-variant";

/** "Red / S" from a variant's attribute values, alphabetized by attribute name — mirrors the backend's `formatVariantLabel` in stock-report.service.ts so labels read identically everywhere. */
export function formatVariantLabel(variant: Pick<ProductVariant, "attributeValues">): string {
  return [...variant.attributeValues]
    .sort((a, b) => a.attributeValue.attribute.name.localeCompare(b.attributeValue.attribute.name))
    .map((v) => v.attributeValue.value)
    .join(" / ");
}

/** "T-Shirt — Red / S" for a variant, "T-Shirt" for a plain product. */
export function formatProductDisplayName(productName: string, variant: { attributeValues: ProductVariantAttributeValue[] } | null | undefined): string {
  return variant ? `${productName} — ${formatVariantLabel(variant)}` : productName;
}
