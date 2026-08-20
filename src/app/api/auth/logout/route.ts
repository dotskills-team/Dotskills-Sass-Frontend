import { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/config/server-env";
import { clearRefreshTokenCookie } from "@/features/auth/lib/refresh-cookie";

/**
 * Backend-এর POST /auth/logout একটা valid access token (JwtAuthGuard,
 * sessionId JWT payload থেকে) দাবি করে — refresh token দিয়ে নয়। তাই
 * client-এর বর্তমান accessToken এখানে Authorization header হিসেবে
 * forward করা হয়।
 *
 * Backend call ব্যর্থ হলেও (network blip ইত্যাদি) client-side session
 * অবশ্যই শেষ হতে হবে — তাই cookie সবসময় clear হয়, backend-এর ফলাফল
 * নির্বিশেষে।
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    try {
      await fetch(`${serverEnv.backendInternalApiUrl}/auth/logout`, {
        method: "POST",
        headers: { Authorization: authHeader },
        cache: "no-store",
      });
    } catch {
      // Best-effort — see doc comment above.
    }
  }

  const response = NextResponse.json({ success: true });
  clearRefreshTokenCookie(response);
  return response;
}
