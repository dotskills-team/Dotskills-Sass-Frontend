import { baseApi } from "@/store/api/base-api";
import type { Unit, UnitStatus } from "@/types/unit";
import type { UnitMutationPayload } from "@/features/unit/lib/unit-form-mapper";

/**
 * `companies/:companyId/units` — `CompanyContextGuard`-guarded, unpaginated
 * (verified `unit.service.ts` `list()` — plain `findMany`, no page/limit).
 */
export const unitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUnits: builder.query<Unit[], string>({
      query: (companyId) => `/companies/${companyId}/units`,
      transformResponse: (response: { data: Unit[] }) => response.data,
      providesTags: ["Unit", "CompanyScoped"],
    }),

    createUnit: builder.mutation<unknown, { companyId: string; body: UnitMutationPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/units`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Unit"],
    }),

    updateUnit: builder.mutation<
      unknown,
      { companyId: string; id: string; body: Omit<UnitMutationPayload, "code"> & { status?: UnitStatus } }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/units/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Unit"],
    }),
  }),
});

export const { useListUnitsQuery, useCreateUnitMutation, useUpdateUnitMutation } = unitApi;
