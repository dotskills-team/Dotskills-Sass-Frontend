import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { serverEnv } from "@/config/server-env";
import {
  REFRESH_TOKEN_COOKIE,
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/features/auth/lib/refresh-cookie";

/**
 * Browser → this route (no body needed — refresh token comes from the
 * HttpOnly cookie, never from client JS) → NestJS /auth/refresh.
 *
 * Backend rotates the refresh token on every call (reuse-detection —
 * verified in an earlier milestone), so the new refreshToken always
 * replaces the cookie here. Backend does NOT return a `user` field on
 * refresh — callers needing the user object should call authApi.getMe
 * after a successful refresh.
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: "No active session", error: "Unauthorized", statusCode: 401 },
      { status: 401 },
    );
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${serverEnv.backendInternalApiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to reach the authentication service.",
        error: "Bad Gateway",
        statusCode: 502,
      },
      { status: 502 },
    );
  }

  const data = await backendResponse.json();

  if (!backendResponse.ok) {
    const response = NextResponse.json(data, { status: backendResponse.status });
    clearRefreshTokenCookie(response);
    return response;
  }

  const { refreshToken: newRefreshToken, refreshTokenExpiresIn, ...clientSafeData } = data;

  const response = NextResponse.json(clientSafeData, { status: 200 });
  setRefreshTokenCookie(response, newRefreshToken, refreshTokenExpiresIn);
  return response;
}
