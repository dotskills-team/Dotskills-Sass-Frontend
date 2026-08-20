import "server-only";
import { NextResponse } from "next/server";

/**
 * Refresh token শুধুমাত্র এই HttpOnly cookie-তে থাকে — JavaScript কখনো
 * এটা read করতে পারে না। শুধু Route Handler (app/api/auth/*) এবং
 * proxy.ts-এর optimistic check এটা touch করে।
 */
export const REFRESH_TOKEN_COOKIE = "dotskills_refresh_token";

export function setRefreshTokenCookie(
  response: NextResponse,
  refreshToken: string,
  expiresInSeconds: number,
): void {
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSeconds,
  });
}

export function clearRefreshTokenCookie(response: NextResponse): void {
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}
