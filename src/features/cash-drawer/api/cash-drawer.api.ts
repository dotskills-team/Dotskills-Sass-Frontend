import { baseApi } from "@/store/api/base-api";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";
import type { CashDrawerSession, CashDrawerSessionStatus } from "@/types/cash-drawer-session";

export interface ListCashDrawerSessionsParams {
  companyId: string;
  page?: number;
  limit?: number;
  locationId?: string;
  cashierId?: string;
  status?: CashDrawerSessionStatus;
}

export interface OpenCashDrawerSessionPayload {
  locationId: string;
  openingBalance?: number;
}

export interface CloseCashDrawerSessionPayload {
  actualClosingBalance: number;
  note?: string;
}

/** `companies/:companyId/cash-drawer-sessions` — paginated (Frontend Phase 4 backend addition, mirrors PurchaseOrder/StockTransfer/Sale's shape). */
export const cashDrawerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listCashDrawerSessions: builder.query<ListResult<CashDrawerSession>, ListCashDrawerSessionsParams>({
      query: ({ companyId, page, limit, locationId, cashierId, status }) => ({
        url: `/companies/${companyId}/cash-drawer-sessions`,
        params: { page, limit, locationId, cashierId, status },
      }),
      transformResponse: (response: { data: CashDrawerSession[]; pagination: ListResult<CashDrawerSession>["meta"] }) =>
        normalizeItemsEnvelope({ items: response.data, meta: response.pagination! }),
      providesTags: ["CashDrawerSession", "CompanyScoped"],
    }),

    /** `GET .../cash-drawer-sessions/:id` — reused by the Cash Drawer Variance notification's redirect target (`/company/cash-drawer/sessions/[id]`); the service's own ownership/location checks already apply. */
    getCashDrawerSession: builder.query<CashDrawerSession, { companyId: string; id: string }>({
      query: ({ companyId, id }) => `/companies/${companyId}/cash-drawer-sessions/${id}`,
      transformResponse: (response: { data: CashDrawerSession }) => response.data,
      providesTags: ["CashDrawerSession"],
    }),

    openCashDrawerSession: builder.mutation<CashDrawerSession, { companyId: string; body: OpenCashDrawerSessionPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/cash-drawer-sessions`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: CashDrawerSession }) => response.data,
      invalidatesTags: ["CashDrawerSession"],
    }),

    closeCashDrawerSession: builder.mutation<
      CashDrawerSession,
      { companyId: string; id: string; body: CloseCashDrawerSessionPayload }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/cash-drawer-sessions/${id}/close`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: { data: CashDrawerSession }) => response.data,
      invalidatesTags: ["CashDrawerSession"],
    }),
  }),
});

export const {
  useListCashDrawerSessionsQuery,
  useGetCashDrawerSessionQuery,
  useOpenCashDrawerSessionMutation,
  useCloseCashDrawerSessionMutation,
} = cashDrawerApi;
