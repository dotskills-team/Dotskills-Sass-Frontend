import { baseApi } from "@/store/api/base-api";
import type { Customer, CustomerStatus } from "@/types/customer";
import type { CustomerMutationPayload } from "@/features/customer/lib/customer-form-mapper";

/** `companies/:companyId/customers` — unpaginated (verified customer.service.ts `list()`). */
export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listCustomers: builder.query<Customer[], string>({
      query: (companyId) => `/companies/${companyId}/customers`,
      transformResponse: (response: { data: Customer[] }) => response.data,
      providesTags: ["Customer", "CompanyScoped"],
    }),

    createCustomer: builder.mutation<unknown, { companyId: string; body: CustomerMutationPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/customers`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),

    updateCustomer: builder.mutation<
      unknown,
      { companyId: string; id: string; body: Partial<CustomerMutationPayload> & { status?: CustomerStatus } }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/customers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const { useListCustomersQuery, useCreateCustomerMutation, useUpdateCustomerMutation } = customerApi;
