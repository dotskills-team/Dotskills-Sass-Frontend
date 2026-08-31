import { z } from "zod";

/** Backend `CreateProductDto`/`UpdateProductDto` mirrored exactly (verified product/dto/product.dto.ts). `sku` is immutable after creation (not in `UpdateProductDto`). */
export interface ProductFormMessages {
  skuRequired: string;
  skuLength: string;
  nameRequired: string;
  nameLength: string;
  baseUnitRequired: string;
  pricePositive: string;
}

export function createProductSchema(messages: ProductFormMessages) {
  return z.object({
    sku: z
      .string({ error: messages.skuRequired })
      .min(1, { error: messages.skuRequired })
      .max(60, { error: messages.skuLength }),
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(200, { error: messages.nameLength }),
    categoryId: z.string().optional().or(z.literal("")),
    baseUnitId: z.string({ error: messages.baseUnitRequired }).min(1, { error: messages.baseUnitRequired }),
    barcode: z.string().max(64).optional().or(z.literal("")),
    costPrice: nonNegativePriceField(messages.pricePositive),
    salePrice: nonNegativePriceField(messages.pricePositive),
    reorderLevel: nonNegativePriceField(messages.pricePositive),
    sellByWeight: z.boolean(),
  });
}

function nonNegativePriceField(message: string) {
  return z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || Number(value) >= 0, { error: message });
}

export type ProductFormValues = z.infer<ReturnType<typeof createProductSchema>>;
