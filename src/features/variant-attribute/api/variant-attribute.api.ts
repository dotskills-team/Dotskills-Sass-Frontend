import { baseApi } from "@/store/api/base-api";
import type { VariantAttribute } from "@/types/product-variant";

export interface CreateVariantAttributePayload {
  name: string;
  values: string[];
}

export interface AddVariantAttributeValuePayload {
  value: string;
}

/** `companies/:companyId/variant-attributes` — company-scoped catalog of Size/Color-style attributes, reused across every Product that has variants. Unpaginated (a company realistically has a handful of these, same reasoning as Category/Unit). */
export const variantAttributeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listVariantAttributes: builder.query<VariantAttribute[], string>({
      query: (companyId) => `/companies/${companyId}/variant-attributes`,
      transformResponse: (response: { data: VariantAttribute[] }) => response.data,
      providesTags: ["VariantAttribute", "CompanyScoped"],
    }),

    createVariantAttribute: builder.mutation<
      { data: VariantAttribute },
      { companyId: string; body: CreateVariantAttributePayload }
    >({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/variant-attributes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["VariantAttribute"],
    }),

    addVariantAttributeValue: builder.mutation<
      unknown,
      { companyId: string; attributeId: string; body: AddVariantAttributeValuePayload }
    >({
      query: ({ companyId, attributeId, body }) => ({
        url: `/companies/${companyId}/variant-attributes/${attributeId}/values`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["VariantAttribute"],
    }),

    removeVariantAttributeValue: builder.mutation<unknown, { companyId: string; attributeId: string; valueId: string }>({
      query: ({ companyId, attributeId, valueId }) => ({
        url: `/companies/${companyId}/variant-attributes/${attributeId}/values/${valueId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VariantAttribute"],
    }),

    removeVariantAttribute: builder.mutation<unknown, { companyId: string; attributeId: string }>({
      query: ({ companyId, attributeId }) => ({
        url: `/companies/${companyId}/variant-attributes/${attributeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VariantAttribute"],
    }),
  }),
});

export const {
  useListVariantAttributesQuery,
  useCreateVariantAttributeMutation,
  useAddVariantAttributeValueMutation,
  useRemoveVariantAttributeValueMutation,
  useRemoveVariantAttributeMutation,
} = variantAttributeApi;
