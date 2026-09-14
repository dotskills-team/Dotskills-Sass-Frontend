import { baseApi } from "@/store/api/base-api";
import type { ProductVariant } from "@/types/product-variant";

export interface ProductVariantMutationPayload {
  sku: string;
  barcode?: string;
  costPrice: number;
  salePrice: number;
  attributeValueIds: string[];
}

export interface UpdateProductVariantPayload {
  barcode?: string;
  costPrice?: number;
  salePrice?: number;
  status?: ProductVariant["status"];
  attributeValueIds?: string[];
}

/** `companies/:companyId/products/:productId/variants` — unpaginated (a single product realistically has a handful of variants, same reasoning as Category/Unit/VariantAttribute). */
export const productVariantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProductVariants: builder.query<ProductVariant[], { companyId: string; productId: string }>({
      query: ({ companyId, productId }) => `/companies/${companyId}/products/${productId}/variants`,
      transformResponse: (response: { data: ProductVariant[] }) => response.data,
      providesTags: ["ProductVariant", "CompanyScoped"],
    }),

    createProductVariant: builder.mutation<
      { data: ProductVariant },
      { companyId: string; productId: string; body: ProductVariantMutationPayload }
    >({
      query: ({ companyId, productId, body }) => ({
        url: `/companies/${companyId}/products/${productId}/variants`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProductVariant", "Product"],
    }),

    updateProductVariant: builder.mutation<
      { data: ProductVariant },
      { companyId: string; productId: string; id: string; body: UpdateProductVariantPayload }
    >({
      query: ({ companyId, productId, id, body }) => ({
        url: `/companies/${companyId}/products/${productId}/variants/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ProductVariant"],
    }),

    removeProductVariant: builder.mutation<unknown, { companyId: string; productId: string; id: string }>({
      query: ({ companyId, productId, id }) => ({
        url: `/companies/${companyId}/products/${productId}/variants/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductVariant", "Product"],
    }),
  }),
});

export const {
  useListProductVariantsQuery,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useRemoveProductVariantMutation,
} = productVariantApi;
