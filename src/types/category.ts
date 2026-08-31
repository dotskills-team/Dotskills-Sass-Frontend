export type CategoryStatus = "ACTIVE" | "INACTIVE";

/** `GET /companies/:companyId/categories` item (verified `CATEGORY_SELECT` in category.service.ts). */
export interface Category {
  id: string;
  name: string;
  parentCategoryId: string | null;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}
