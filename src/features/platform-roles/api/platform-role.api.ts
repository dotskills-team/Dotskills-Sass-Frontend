import { baseApi } from "@/store/api/base-api";
import type { PlatformPermissionCatalogItem, PlatformRole, PlatformRoleStatus } from "@/types/platform-role";

export interface CreatePlatformRoleBody {
  code: string;
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface UpdatePlatformRoleBody {
  name?: string;
  description?: string;
}

/**
 * `GET /platform/roles`/`GET /platform/roles/:id` `{success,count,data}`/`{success,data}`
 * envelope (verified) — Company RBAC-এর role endpoint-গুলোর exact একই shape।
 */
export const platformRoleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPlatformPermissions: builder.query<PlatformPermissionCatalogItem[], void>({
      query: () => "/platform/permissions",
      transformResponse: (response: { data: PlatformPermissionCatalogItem[] }) => response.data,
    }),

    listPlatformRoles: builder.query<PlatformRole[], void>({
      query: () => "/platform/roles",
      transformResponse: (response: { data: PlatformRole[] }) => response.data,
      providesTags: ["PlatformRole"],
    }),

    getPlatformRole: builder.query<PlatformRole, string>({
      query: (id) => `/platform/roles/${id}`,
      transformResponse: (response: { data: PlatformRole }) => response.data,
      providesTags: ["PlatformRole"],
    }),

    createPlatformRole: builder.mutation<unknown, CreatePlatformRoleBody>({
      query: (body) => ({ url: "/platform/roles", method: "POST", body }),
      invalidatesTags: ["PlatformRole"],
    }),

    updatePlatformRole: builder.mutation<unknown, { id: string; body: UpdatePlatformRoleBody }>({
      query: ({ id, body }) => ({ url: `/platform/roles/${id}`, method: "PATCH", body }),
      invalidatesTags: ["PlatformRole"],
    }),

    updatePlatformRoleStatus: builder.mutation<unknown, { id: string; status: PlatformRoleStatus }>({
      query: ({ id, status }) => ({
        url: `/platform/roles/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["PlatformRole"],
    }),

    replacePlatformRolePermissions: builder.mutation<
      unknown,
      { id: string; permissions: { code: string; effect: "ALLOW" | "DENY" }[] }
    >({
      query: ({ id, permissions }) => ({
        url: `/platform/roles/${id}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      invalidatesTags: ["PlatformRole"],
    }),

    /**
     * `POST /platform/access-control/setup` — no request body, idempotent bulk upsert of the
     * static permission catalog + re-map of SUPER_ADMIN/PLATFORM_ADMIN's code lists (verified
     * `access-control-setup.service.ts`). Gated entirely inside the service by
     * `actor.roles.includes('SUPER_ADMIN')` — no `@RequirePlatformPermissions` decorator exists
     * for this route, so no permission code was invented for it; the frontend gate mirrors the
     * same SUPER_ADMIN role check instead (see `SyncPermissionCatalogButton`).
     */
    syncPermissionCatalog: builder.mutation<
      { success: boolean; data: { permissionsUpserted: number; mappedRoles: string[] } },
      void
    >({
      query: () => ({ url: "/platform/access-control/setup", method: "POST" }),
      invalidatesTags: ["PlatformRole"],
    }),
  }),
});

export const {
  useListPlatformPermissionsQuery,
  useListPlatformRolesQuery,
  useGetPlatformRoleQuery,
  useCreatePlatformRoleMutation,
  useUpdatePlatformRoleMutation,
  useUpdatePlatformRoleStatusMutation,
  useReplacePlatformRolePermissionsMutation,
  useSyncPermissionCatalogMutation,
} = platformRoleApi;
