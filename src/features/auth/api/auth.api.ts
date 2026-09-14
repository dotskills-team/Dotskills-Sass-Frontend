import { baseApi } from "@/store/api/base-api";
import type {
  BackendErrorBody,
} from "@/types/api-error";
import type {
  CurrentUser,
  ForgotPasswordPayload,
  GenericAuthResult,
  LoginCredentials,
  ResetPasswordPayload,
  SessionResult,
} from "@/types/auth";

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

    /** login/refresh/logout-এর মতো BFF/queryFn দরকার নেই — কোনো cookie/token touch করে না, সরাসরি backend-এ যায় (getMe-এর মতো)। */
    forgotPassword: builder.mutation<GenericAuthResult, ForgotPasswordPayload>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),

    /** Optional pre-check (backend `GET /auth/reset-password/:token`) — form দেখানোর আগে token আসলেই valid কিনা জানতে। */
    validateResetToken: builder.query<{ valid: boolean }, string>({
      query: (token) => `/auth/reset-password/${encodeURIComponent(token)}`,
    }),

    resetPassword: builder.mutation<GenericAuthResult, ResetPasswordPayload>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
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
  useForgotPasswordMutation,
  useValidateResetTokenQuery,
  useResetPasswordMutation,
} = authApi;
