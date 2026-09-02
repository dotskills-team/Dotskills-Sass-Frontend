import { baseApi } from "@/store/api/base-api";
import type { CompanyMember, CompanyPermission, CompanyRole } from "@/types/company-rbac";

export interface CreateCompanyRoleBody {
  code: string;
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface UpdateCompanyRoleBody {
  name?: string;
  description?: string;
}

export interface CreateCompanyMemberBody {
  email: string;
  fullName: string;
  password?: string;
  employeeCode?: string;
  designation?: string;
  roleCodes: string[];
}

/** `GET /companies/:companyId/rbac/my-location-access` — `all:true` for an unrestricted (LOCATION_ACCESS_ALL) actor. */
export interface MyLocationAccess {
  all: boolean;
  locationIds: string[];
}

/**
 * Company RBAC (`companies/:companyId/rbac/*`) `CompanyContextGuard`-এ guarded — caller-এর
 * সেই company-তে ACTIVE membership থাকা লাগে, `x-company-id` header route param-এর সাথে match
 * করা লাগে (verified company-context.guard.ts)। `base-api.ts`-এর `prepareHeaders` ইতিমধ্যে
 * Redux `company.currentCompanyId` থেকে এই header auto-attach করে (CompanySelector-এর মাধ্যমে
 * set হওয়া) — তাই এই endpoint-গুলো company portal ((company) route group)-এ ব্যবহারযোগ্য,
 * platform portal-এ না (platform staff সাধারণত কোনো company-র সদস্য নয়)।
 */
export const companyRbacApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Platform-scoped (`PlatformPermissionsGuard`, না `CompanyContextGuard`) — platform admin যেকোনো company bootstrap করতে পারে। */
    bootstrapCompanyRbac: builder.mutation<
      unknown,
      { companyId: string; ownerUserId?: string; ownerEmail?: string }
    >({
      query: ({ companyId, ...body }) => ({
        url: `/platform/companies/${companyId}/rbac/bootstrap`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CompanyRole", "CompanyMember"],
    }),

    listCompanyPermissions: builder.query<CompanyPermission[], string>({
      query: (companyId) => `/companies/${companyId}/rbac/permissions`,
      transformResponse: (response: { data: CompanyPermission[] }) => response.data,
    }),

    listCompanyRoles: builder.query<CompanyRole[], string>({
      query: (companyId) => `/companies/${companyId}/rbac/roles`,
      transformResponse: (response: { data: CompanyRole[] }) => response.data,
      providesTags: ["CompanyRole"],
    }),

    createCompanyRole: builder.mutation<unknown, { companyId: string; body: CreateCompanyRoleBody }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/rbac/roles`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CompanyRole"],
    }),

    updateCompanyRole: builder.mutation<
      unknown,
      { companyId: string; roleId: string; body: UpdateCompanyRoleBody }
    >({
      query: ({ companyId, roleId, body }) => ({
        url: `/companies/${companyId}/rbac/roles/${roleId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CompanyRole"],
    }),

    replaceCompanyRolePermissions: builder.mutation<
      unknown,
      { companyId: string; roleId: string; permissions: { code: string; effect: "ALLOW" | "DENY" }[] }
    >({
      query: ({ companyId, roleId, permissions }) => ({
        url: `/companies/${companyId}/rbac/roles/${roleId}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      invalidatesTags: ["CompanyRole"],
    }),

    listCompanyMembers: builder.query<CompanyMember[], string>({
      query: (companyId) => `/companies/${companyId}/rbac/members`,
      transformResponse: (response: { data: CompanyMember[] }) => response.data,
      providesTags: ["CompanyMember"],
    }),

    createCompanyMember: builder.mutation<unknown, { companyId: string; body: CreateCompanyMemberBody }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/rbac/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CompanyMember"],
    }),

    replaceCompanyMemberRoles: builder.mutation<
      unknown,
      { companyId: string; memberId: string; roleCodes: string[] }
    >({
      query: ({ companyId, memberId, roleCodes }) => ({
        url: `/companies/${companyId}/rbac/members/${memberId}/roles`,
        method: "PUT",
        body: { roleCodes },
      }),
      invalidatesTags: ["CompanyMember"],
    }),

    updateCompanyMemberStatus: builder.mutation<
      unknown,
      { companyId: string; memberId: string; status: "ACTIVE" | "SUSPENDED" | "REVOKED" }
    >({
      query: ({ companyId, memberId, status }) => ({
        url: `/companies/${companyId}/rbac/members/${memberId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["CompanyMember"],
    }),

    replaceCompanyMemberScopes: builder.mutation<
      unknown,
      {
        companyId: string;
        memberId: string;
        scopes: { type: "COMPANY" | "BRANCH" | "WAREHOUSE" | "POS_COUNTER"; key: string }[];
      }
    >({
      query: ({ companyId, memberId, scopes }) => ({
        url: `/companies/${companyId}/rbac/members/${memberId}/scopes`,
        method: "PUT",
        body: { scopes },
      }),
      invalidatesTags: ["CompanyMember"],
    }),

    replaceCompanyMemberLocations: builder.mutation<
      unknown,
      { companyId: string; memberId: string; locationIds: string[] }
    >({
      query: ({ companyId, memberId, locationIds }) => ({
        url: `/companies/${companyId}/rbac/members/${memberId}/locations`,
        method: "PUT",
        body: { locationIds },
      }),
      invalidatesTags: ["CompanyMember"],
    }),

    /**
     * No permission gate on the backend route (any active member may know
     * their own access) — every LBAC-aware Location <Select> calls this to
     * filter its options. Backend enforcement (LocationAccessService in
     * each business-ops service) is the real boundary; this is only the
     * UX-quality companion.
     */
    getMyLocationAccess: builder.query<MyLocationAccess, string>({
      query: (companyId) => `/companies/${companyId}/rbac/my-location-access`,
      transformResponse: (response: { data: MyLocationAccess }) => response.data,
      providesTags: ["CompanyScoped"],
    }),
  }),
});

export const {
  useBootstrapCompanyRbacMutation,
  useListCompanyPermissionsQuery,
  useListCompanyRolesQuery,
  useCreateCompanyRoleMutation,
  useUpdateCompanyRoleMutation,
  useReplaceCompanyRolePermissionsMutation,
  useListCompanyMembersQuery,
  useCreateCompanyMemberMutation,
  useReplaceCompanyMemberRolesMutation,
  useUpdateCompanyMemberStatusMutation,
  useReplaceCompanyMemberScopesMutation,
  useReplaceCompanyMemberLocationsMutation,
  useGetMyLocationAccessQuery,
} = companyRbacApi;
