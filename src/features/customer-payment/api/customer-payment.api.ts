import { baseApi } from "@/store/api/base-api";
import type { CustomerDueLedgerEntry } from "@/types/customer-due-ledger";
import type { CustomerPaymentMutationPayload } from "@/features/customer-payment/lib/customer-payment-form-mapper";

/** `companies/:companyId/customer-payments` — unpaginated (a ledger's row count per company is naturally bounded, same reasoning as Customer/Supplier lists). */
export const customerPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listCustomerPayments: builder.query<CustomerDueLedgerEntry[], { companyId: string; customerId?: string }>({
      query: ({ companyId, customerId }) => ({
        url: `/companies/${companyId}/customer-payments`,
        params: customerId ? { customerId } : undefined,
      }),
      transformResponse: (response: { data: CustomerDueLedgerEntry[] }) => response.data,
      providesTags: ["CustomerPayment"],
    }),

    recordCustomerPayment: builder.mutation<
      CustomerDueLedgerEntry,
      { companyId: string; body: CustomerPaymentMutationPayload }
    >({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/customer-payments`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: CustomerDueLedgerEntry }) => response.data,
      invalidatesTags: ["CustomerPayment", "Customer"],
    }),
  }),
});

export const { useListCustomerPaymentsQuery, useRecordCustomerPaymentMutation } = customerPaymentApi;
