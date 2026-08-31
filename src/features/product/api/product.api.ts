import { baseApi } from "@/store/api/base-api";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";
import type { Product, ProductStatus } from "@/types/product";
import type { ProductMutationPayload } from "@/features/product/lib/product-form-mapper";

export interface ListProductsParams {
  companyId: string;
  page?: number;
  limit?: number;
  /** POS product search (Frontend Phase 3, backend Gap 2) — matched against name/sku/barcode, case-insensitive. */
  search?: string;
}

/** `companies/:companyId/products` — the one Master Data list that's paginated (backend Phase 6-shaped `{success, data, pagination}`, mirrored here to `{items, meta}` via `normalizeItemsEnvelope`). */
export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProducts: builder.query<ListResult<Product>, ListProductsParams>({
      query: ({ companyId, page, limit, search }) => ({
        url: `/companies/${companyId}/products`,
        params: { page, limit, search },
      }),
      transformResponse: (response: { data: Product[]; pagination: ListResult<Product>["meta"] }) =>
        normalizeItemsEnvelope({ items: response.data, meta: response.pagination! }),
      providesTags: ["Product", "CompanyScoped"],
    }),

    createProduct: builder.mutation<unknown, { companyId: string; body: ProductMutationPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/products`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation<
      unknown,
      { companyId: string; id: string; body: Partial<Omit<ProductMutationPayload, "sku">> & { status?: ProductStatus } }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/products/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const { useListProductsQuery, useCreateProductMutation, useUpdateProductMutation } = productApi;
