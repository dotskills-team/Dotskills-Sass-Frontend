import { baseApi } from "@/store/api/base-api";
import type { DashboardOverview } from "@/types/dashboard";

export interface DashboardOverviewParams {
  companyId: string;
  dateFrom: string;
  dateTo: string;
  locationId?: string;
}

/**
 * `companies/:companyId/dashboard/overview` — RTK Query's own arg-based
 * cache key already makes the cache scope-aware for free: every distinct
 * `{companyId, dateFrom, dateTo, locationId}` combination gets its own
 * cache entry, so switching company/date/branch can never leak another
 * scope's cached numbers. `providesTags: ["Dashboard", "CompanyScoped"]`
 * lets the handful of business mutations that actually change dashboard
 * data (Sale, Purchase receive/return, Stock Adjustment, Customer/Supplier
 * Payment — see each of those `*.api.ts` files) invalidate just this tag,
 * not the entire cache.
 */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverview, DashboardOverviewParams>({
      query: ({ companyId, dateFrom, dateTo, locationId }) => ({
        url: `/companies/${companyId}/dashboard/overview`,
        params: { dateFrom, dateTo, locationId },
      }),
      transformResponse: (response: { data: DashboardOverview }) => response.data,
      providesTags: ["Dashboard", "CompanyScoped"],
    }),
  }),
});

export const { useGetDashboardOverviewQuery } = dashboardApi;
