import { baseApi } from "@/store/api/base-api";
import type { Location, LocationStatus } from "@/types/location";
import type { LocationMutationPayload } from "@/features/location/lib/location-form-mapper";

/** `companies/:companyId/locations` — unpaginated (verified location.service.ts `list()`). `locationType` is immutable after creation (not in `UpdateLocationDto`). */
export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listLocations: builder.query<Location[], string>({
      query: (companyId) => `/companies/${companyId}/locations`,
      transformResponse: (response: { data: Location[] }) => response.data,
      providesTags: ["Location", "CompanyScoped"],
    }),

    createLocation: builder.mutation<unknown, { companyId: string; body: LocationMutationPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/locations`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Location"],
    }),

    updateLocation: builder.mutation<
      unknown,
      { companyId: string; id: string; body: Partial<Omit<LocationMutationPayload, "locationType">> & { status?: LocationStatus } }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/locations/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Location"],
    }),
  }),
});

export const { useListLocationsQuery, useCreateLocationMutation, useUpdateLocationMutation } = locationApi;
