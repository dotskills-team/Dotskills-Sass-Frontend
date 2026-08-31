import type { CategoryFormValues } from "@/features/category/schemas/category.schema";

export interface CategoryMutationPayload {
  name: string;
  parentCategoryId?: string;
}

export function toCategoryPayload(values: CategoryFormValues): CategoryMutationPayload {
  return {
    name: values.name.trim(),
    parentCategoryId: values.parentCategoryId || undefined,
  };
}
