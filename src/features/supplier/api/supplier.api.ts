import { baseApi } from "@/store/api/base-api";
import type { Supplier, SupplierStatus } from "@/types/supplier";
import type { SupplierMutationPayload } from "@/features/supplier/lib/supplier-form-mapper";

/** `companies/:companyId/suppliers` — unpaginated (verified supplier.service.ts `list()`). */
export const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSuppliers: builder.query<Supplier[], string>({
      query: (companyId) => `/companies/${companyId}/suppliers`,
      transformResponse: (response: { data: Supplier[] }) => response.data,
      providesTags: ["Supplier", "CompanyScoped"],
    }),

    createSupplier: builder.mutation<unknown, { companyId: string; body: SupplierMutationPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/suppliers`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Supplier"],
    }),

    updateSupplier: builder.mutation<
      unknown,
      { companyId: string; id: string; body: Partial<SupplierMutationPayload> & { status?: SupplierStatus } }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/suppliers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Supplier"],
    }),
  }),
});

export const { useListSuppliersQuery, useCreateSupplierMutation, useUpdateSupplierMutation } = supplierApi;
