import { baseApi } from "@/store/api/base-api";
import type { SupplierPayableLedgerEntry } from "@/types/supplier-payable-ledger";
import type { SupplierPaymentMutationPayload } from "@/features/supplier-payment/lib/supplier-payment-form-mapper";

/** `companies/:companyId/supplier-payments` — unpaginated (a ledger's row count per company is naturally bounded, same reasoning as Customer/Supplier lists). */
export const supplierPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSupplierPayments: builder.query<SupplierPayableLedgerEntry[], { companyId: string; supplierId?: string }>({
      query: ({ companyId, supplierId }) => ({
        url: `/companies/${companyId}/supplier-payments`,
        params: supplierId ? { supplierId } : undefined,
      }),
      transformResponse: (response: { data: SupplierPayableLedgerEntry[] }) => response.data,
      providesTags: ["SupplierPayment"],
    }),

    recordSupplierPayment: builder.mutation<
      SupplierPayableLedgerEntry,
      { companyId: string; body: SupplierPaymentMutationPayload }
    >({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/supplier-payments`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: SupplierPayableLedgerEntry }) => response.data,
      invalidatesTags: ["SupplierPayment", "Supplier"],
    }),
  }),
});

export const { useListSupplierPaymentsQuery, useRecordSupplierPaymentMutation } = supplierPaymentApi;
