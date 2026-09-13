import { baseApi } from "@/store/api/base-api";
import type { PlatformDashboardOverview } from "@/types/platform-dashboard";

export interface PlatformDashboardOverviewParams {
  dateFrom: string;
  dateTo: string;
}

/**
 * `platform/dashboard/overview` — RTK Query's own arg-based cache key
 * already scopes this per date range (there is no company/location
 * dimension here — this is deliberately platform-global). Tagged
 * `"PlatformDashboard"` so the handful of mutations that actually change
 * these numbers (Company create, Subscription/Payment/Billing changes)
 * can invalidate it precisely.
 */
export const platformDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformDashboardOverview: builder.query<PlatformDashboardOverview, PlatformDashboardOverviewParams>({
      query: ({ dateFrom, dateTo }) => ({
        url: `/platform/dashboard/overview`,
        params: { dateFrom, dateTo },
      }),
      transformResponse: (response: { data: PlatformDashboardOverview }) => response.data,
      providesTags: ["PlatformDashboard"],
    }),
  }),
});

export const { useGetPlatformDashboardOverviewQuery } = platformDashboardApi;
