import { baseApi } from "@/store/api/base-api";
import type { PlatformSettings } from "@/types/platform-settings";

/** `platform/settings` — a singleton row (verified `PlatformSettingsService`), GET + logo upload only. */
export const platformSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformSettings: builder.query<PlatformSettings, void>({
      query: () => `/platform/settings`,
      transformResponse: (response: { data: PlatformSettings }) => response.data,
      providesTags: ["PlatformSettings"],
    }),

    /** `fetchBaseQuery` detects a `FormData` body automatically and skips JSON — the browser sets the correct multipart boundary header itself. */
    uploadPlatformLogo: builder.mutation<PlatformSettings, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/platform/settings/logo`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: { data: PlatformSettings }) => response.data,
      invalidatesTags: ["PlatformSettings"],
    }),
  }),
});

export const { useGetPlatformSettingsQuery, useUploadPlatformLogoMutation } = platformSettingsApi;
