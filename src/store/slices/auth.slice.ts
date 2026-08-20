import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { CurrentUser } from "@/types/auth";

export type AuthStatus =
  | "idle"
  | "authenticating"
  | "authenticated"
  | "unauthenticated";

export interface AuthState {
  /** শুধু memory — কখনো কোনো storage-এ persist করা হয় না (section 2)। */
  accessToken: string | null;
  user: CurrentUser | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authenticationStarted(state) {
      state.status = "authenticating";
    },
    /** Full session restore (AuthGate: refresh + getMe both succeeded). */
    sessionRestored(
      state,
      action: PayloadAction<{ accessToken: string; user: CurrentUser }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.status = "authenticated";
    },
    /**
     * Mid-session silent refresh (base-api's 401 interceptor) — user is
     * already known, only the token changes, status stays as-is.
     */
    accessTokenRefreshed(state, action: PayloadAction<{ accessToken: string }>) {
      state.accessToken = action.payload.accessToken;
    },
    loggedOut(state) {
      state.accessToken = null;
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const {
  authenticationStarted,
  sessionRestored,
  accessTokenRefreshed,
  loggedOut,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
