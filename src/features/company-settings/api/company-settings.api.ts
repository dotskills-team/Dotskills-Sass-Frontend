import { baseApi } from "@/store/api/base-api";
import type { CompanySettings } from "@/types/company-settings";
import type { CompanySettingsMutationPayload } from "@/features/company-settings/lib/company-settings-form-mapper";

/** `companies/:companyId/settings` — the row always exists per-company (verified company-settings.service.ts), GET+PATCH only, no create route. */
export const companySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanySettings: builder.query<CompanySettings, string>({
      query: (companyId) => `/companies/${companyId}/settings`,
      transformResponse: (response: { data: CompanySettings }) => response.data,
      providesTags: ["CompanySettings", "CompanyScoped"],
    }),

    updateCompanySettings: builder.mutation<unknown, { companyId: string; body: CompanySettingsMutationPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/settings`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CompanySettings"],
    }),
  }),
});

export const { useGetCompanySettingsQuery, useUpdateCompanySettingsMutation } = companySettingsApi;
