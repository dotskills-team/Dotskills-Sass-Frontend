import { baseApi } from "@/store/api/base-api";
import type { PlatformStaffMember } from "@/types/platform-staff";

export interface ListPlatformStaffParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreatePlatformStaffBody {
  email: string;
  fullName: string;
  password: string;
  employeeCode?: string;
  roleCodes: string[];
}

export interface UpdatePlatformStaffBody {
  fullName?: string;
  employeeCode?: string;
}

/**
 * `GET /platform/staff` meta শুধু `{page, limit, total}` দেয় — `totalPages` backend দেয় না
 * (verified platform-staff.controller.ts), তাই এখানেই derive করা হয় (presentation-layer
 * adaptation, backend data পরিবর্তন নয়, `list-result.ts`-এর normalize pattern-এর মতোই)।
 */
export const platformStaffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPlatformStaff: builder.query<
      { items: PlatformStaffMember[]; meta: { page: number; limit: number; total: number; totalPages: number } },
      ListPlatformStaffParams | void
    >({
      query: (params) => ({ url: "/platform/staff", params: params ?? undefined }),
      transformResponse: (response: {
        data: PlatformStaffMember[];
        meta: { page: number; limit: number; total: number };
      }) => ({
        items: response.data,
        meta: { ...response.meta, totalPages: Math.ceil(response.meta.total / response.meta.limit) },
      }),
      providesTags: ["PlatformStaff"],
    }),

    createPlatformStaff: builder.mutation<unknown, CreatePlatformStaffBody>({
      query: (body) => ({ url: "/platform/staff", method: "POST", body }),
      invalidatesTags: ["PlatformStaff"],
    }),

    updatePlatformStaff: builder.mutation<unknown, { id: string; body: UpdatePlatformStaffBody }>({
      query: ({ id, body }) => ({ url: `/platform/staff/${id}`, method: "PATCH", body }),
      invalidatesTags: ["PlatformStaff"],
    }),

    replacePlatformStaffRoles: builder.mutation<unknown, { id: string; roleCodes: string[] }>({
      query: ({ id, roleCodes }) => ({
        url: `/platform/staff/${id}/roles`,
        method: "PUT",
        body: { roleCodes },
      }),
      invalidatesTags: ["PlatformStaff"],
    }),

    updatePlatformStaffStatus: builder.mutation<
      unknown,
      { id: string; status: "ACTIVE" | "SUSPENDED" | "REVOKED" }
    >({
      query: ({ id, status }) => ({
        url: `/platform/staff/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["PlatformStaff"],
    }),
  }),
});

export const {
  useListPlatformStaffQuery,
  useCreatePlatformStaffMutation,
  useUpdatePlatformStaffMutation,
  useReplacePlatformStaffRolesMutation,
  useUpdatePlatformStaffStatusMutation,
} = platformStaffApi;
