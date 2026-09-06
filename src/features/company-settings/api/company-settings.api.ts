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

    /** `fetchBaseQuery` detects a `FormData` body automatically and skips JSON — the browser sets the correct multipart boundary header itself, no manual Content-Type needed. */
    uploadCompanyLogo: builder.mutation<CompanySettings, { companyId: string; file: File }>({
      query: ({ companyId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/companies/${companyId}/settings/logo`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: { data: CompanySettings }) => response.data,
      // Also invalidates "Company" (not just "CompanySettings") so
      // useGetMyCompaniesQuery — the header/selector's own data source —
      // refetches and picks up the new logoUrl too, not just the Settings page.
      invalidatesTags: ["CompanySettings", "Company"],
    }),
  }),
});

export const {
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
  useUploadCompanyLogoMutation,
} = companySettingsApi;
