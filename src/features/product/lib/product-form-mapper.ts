import type { ProductFormValues } from "@/features/product/schemas/product.schema";

export interface ProductMutationPayload {
  sku?: string;
  name: string;
  categoryId?: string;
  baseUnitId: string;
  barcode?: string;
  costPrice?: number;
  salePrice?: number;
  reorderLevel?: number;
  sellByWeight: boolean;
}

export function toProductPayload(values: ProductFormValues): ProductMutationPayload {
  return {
    sku: values.sku.trim(),
    name: values.name.trim(),
    categoryId: values.categoryId || undefined,
    baseUnitId: values.baseUnitId,
    barcode: values.barcode?.trim() || undefined,
    costPrice: values.costPrice ? Number(values.costPrice) : undefined,
    salePrice: values.salePrice ? Number(values.salePrice) : undefined,
    reorderLevel: values.reorderLevel ? Number(values.reorderLevel) : undefined,
    sellByWeight: values.sellByWeight,
  };
}
