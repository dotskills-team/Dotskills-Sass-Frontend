export type ProductStatus = "ACTIVE" | "INACTIVE";

/** `GET /companies/:companyId/products` item (verified `PRODUCT_SELECT` in product.service.ts). */
export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  categoryId: string | null;
  baseUnitId: string;
  costPrice: string;
  salePrice: string;
  reorderLevel: string;
  sellByWeight: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}
