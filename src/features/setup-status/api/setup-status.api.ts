import { baseApi } from "@/store/api/base-api";
import type { SetupStatusData } from "@/types/setup-status";

/** `companies/:companyId/setup-status` — read-only, backend is the single source of truth (verified `setup-status.service.ts`). No mutation lives here; other features' create mutations (Location/Unit/Product) invalidate the `SetupStatus` tag so this refetches automatically once a step is completed. */
export const setupStatusApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSetupStatus: builder.query<SetupStatusData, string>({
      query: (companyId) => `/companies/${companyId}/setup-status`,
      transformResponse: (response: { data: SetupStatusData }) => response.data,
      providesTags: ["SetupStatus", "CompanyScoped"],
    }),
  }),
});

export const { useGetSetupStatusQuery } = setupStatusApi;
