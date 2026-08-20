import { describe, expect, it } from "vitest";

import {
  accessTokenRefreshed,
  authenticationStarted,
  authReducer,
  loggedOut,
  sessionRestored,
  type AuthState,
} from "./auth.slice";
import type { AuthenticatedUser } from "@/types/auth";

const user: AuthenticatedUser = {
  userId: "u1",
  sessionId: "s1",
  email: "owner@company.test",
  fullName: "Company Owner",
  preferredLocale: "en",
  timezone: "Asia/Dhaka",
  roles: [],
};

const initialState: AuthState = { accessToken: null, user: null, status: "idle" };

describe("auth slice", () => {
  it("authenticationStarted moves status to authenticating", () => {
    const state = authReducer(initialState, authenticationStarted());
    expect(state.status).toBe("authenticating");
  });

  it("sessionRestored sets accessToken, user, and status=authenticated together", () => {
    const state = authReducer(
      initialState,
      sessionRestored({ accessToken: "token-1", user }),
    );

    expect(state).toEqual({ accessToken: "token-1", user, status: "authenticated" });
  });

  it("accessTokenRefreshed only updates the token, leaving status/user untouched", () => {
    const authenticated: AuthState = { accessToken: "token-1", user, status: "authenticated" };
    const state = authReducer(authenticated, accessTokenRefreshed({ accessToken: "token-2" }));

    expect(state).toEqual({ accessToken: "token-2", user, status: "authenticated" });
  });

  it("loggedOut clears everything", () => {
    const authenticated: AuthState = { accessToken: "token-1", user, status: "authenticated" };
    const state = authReducer(authenticated, loggedOut());

    expect(state).toEqual({ accessToken: null, user: null, status: "unauthenticated" });
  });
});
