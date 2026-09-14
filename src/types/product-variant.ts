export type VariantStatus = "ACTIVE" | "INACTIVE";

/** One attribute value already attached to a variant, with its parent attribute's name — matches `ProductVariantService`'s `VARIANT_SELECT` nested shape. */
export interface ProductVariantAttributeValue {
  attributeValue: {
    id: string;
    value: string;
    attribute: { id: string; name: string };
  };
}

/** `GET .../products/:productId/variants` item (verified `VARIANT_SELECT` in product-variant.service.ts). */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode: string | null;
  costPrice: string;
  salePrice: string;
  status: VariantStatus;
  createdAt: string;
  updatedAt: string;
  attributeValues: ProductVariantAttributeValue[];
}

/** One value belonging to a `VariantAttribute` (e.g. "S" under "Size"). */
export interface VariantAttributeValue {
  id: string;
  value: string;
}

/** `GET .../variant-attributes` item (verified `ATTRIBUTE_SELECT` in variant-attribute.service.ts). */
export interface VariantAttribute {
  id: string;
  name: string;
  createdAt: string;
  values: VariantAttributeValue[];
}
