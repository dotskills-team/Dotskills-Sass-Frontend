import { baseApi } from "@/store/api/base-api";
import type {
  BackendErrorBody,
} from "@/types/api-error";
import type { CurrentUser, LoginCredentials, SessionResult } from "@/types/auth";

/**
 * login/refresh/logout — এই তিনটা BFF route (app/api/auth/*), backend নয়,
 * তাই সাধারণ backend-pointed baseQuery দিয়ে না গিয়ে queryFn দিয়ে সরাসরি
 * same-origin fetch করা হয় (নাহলে BFF নিজেই নিজের reauth pipeline-এর
 * অংশ হয়ে যেত, যেটা circular)। getMe সত্যিকারের backend call, তাই সেটা
 * স্বাভাবিক reauth-wrapped baseQuery ব্যবহার করে।
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<SessionResult, LoginCredentials>({
      async queryFn(credentials) {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok) {
            return { error: toFetchBaseQueryError(response.status, data) };
          }

          return { data: data as SessionResult };
        } catch {
          return { error: { status: "FETCH_ERROR", error: "network error" } };
        }
      },
    }),

    refreshSession: builder.mutation<SessionResult, void>({
      async queryFn() {
        try {
          const response = await fetch("/api/auth/refresh", { method: "POST" });
          const data = await response.json();

          if (!response.ok) {
            return { error: toFetchBaseQueryError(response.status, data) };
          }

          return { data: data as SessionResult };
        } catch {
          return { error: { status: "FETCH_ERROR", error: "network error" } };
        }
      },
    }),

    logout: builder.mutation<{ success: boolean }, { accessToken: string | null }>({
      async queryFn({ accessToken }) {
        try {
          const response = await fetch("/api/auth/logout", {
            method: "POST",
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          });
          const data = await response.json();

          return { data };
        } catch {
          return { error: { status: "FETCH_ERROR", error: "network error" } };
        }
      },
    }),

    getMe: builder.query<{ success: boolean; user: CurrentUser }, void>({
      query: () => "/auth/me",
    }),
  }),
});

function toFetchBaseQueryError(status: number, data: BackendErrorBody) {
  return { status, data } as const;
}

export const {
  useLoginMutation,
  useRefreshSessionMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;
