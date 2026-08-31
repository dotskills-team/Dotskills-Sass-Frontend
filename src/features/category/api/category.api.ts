import { baseApi } from "@/store/api/base-api";
import type { Category, CategoryStatus } from "@/types/category";
import type { CategoryMutationPayload } from "@/features/category/lib/category-form-mapper";

/** `companies/:companyId/categories` — unpaginated (verified category.service.ts `list()`). */
export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listCategories: builder.query<Category[], string>({
      query: (companyId) => `/companies/${companyId}/categories`,
      transformResponse: (response: { data: Category[] }) => response.data,
      providesTags: ["Category", "CompanyScoped"],
    }),

    createCategory: builder.mutation<unknown, { companyId: string; body: CategoryMutationPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/categories`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      unknown,
      { companyId: string; id: string; body: CategoryMutationPayload & { status?: CategoryStatus } }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const { useListCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation } = categoryApi;
