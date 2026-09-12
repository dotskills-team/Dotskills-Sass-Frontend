import { baseApi } from "@/store/api/base-api";
import type { UserProfile } from "@/types/user-profile";

/** `users/me/*` — always scoped to the calling user's own JWT, never a client-supplied id. */
export const userProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<UserProfile, void>({
      query: () => `/users/me/profile`,
      transformResponse: (response: { data: UserProfile }) => response.data,
      providesTags: ["UserProfile"],
    }),

    /** `fetchBaseQuery` detects a `FormData` body automatically and skips JSON — the browser sets the correct multipart boundary header itself. */
    uploadProfileImage: builder.mutation<UserProfile, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/users/me/profile-image`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: { data: UserProfile }) => response.data,
      invalidatesTags: ["UserProfile"],
    }),

    updateName: builder.mutation<UserProfile, { fullName: string }>({
      query: (body) => ({
        url: `/users/me/name`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: { data: UserProfile }) => response.data,
      invalidatesTags: ["UserProfile"],
    }),

    changePassword: builder.mutation<
      { success: boolean; message: string; otherSessionsRevoked: number },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: `/users/me/password`,
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUploadProfileImageMutation,
  useUpdateNameMutation,
  useChangePasswordMutation,
} = userProfileApi;
