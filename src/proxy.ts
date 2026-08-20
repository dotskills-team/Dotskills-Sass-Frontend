import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/platform", "/company"];
const PUBLIC_ONLY_PATHS = ["/login"];

/** src/features/auth/lib/refresh-cookie.ts-এর সাথে অবশ্যই মেলাতে হবে। */
const REFRESH_TOKEN_COOKIE = "dotskills_refresh_token";

/**
 * Next.js 16-এ `middleware.ts` deprecated, `proxy.ts`-এ rename হয়েছে
 * (function নামও `proxy`) — node_modules/next/dist/docs থেকে verify করা।
 *
 * এটা শুধুমাত্র optimistic UX check: refresh-token cookie-র presence
 * দেখে (JWT verify/decode করে না — refresh token payload-এ roles/scope
 * থাকেও না, তাই platform-vs-company routing এখান থেকে সম্ভবও না)।
 * Actual authorization backend করে; এটা bypass হলেও backend request
 * reject করবে।
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(REFRESH_TOKEN_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isPublicOnly = PUBLIC_ONLY_PATHS.includes(pathname);

  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicOnly && hasSessionCookie) {
    /**
     * শুধু `/`-এ redirect করলে dead-end হয়: এই cookie presence check
     * validity verify করে না (উপরের comment দেখুন), আর `/` কোনো
     * AuthGate দিয়ে wrap করা না, তাই stale/orphaned cookie (backend
     * session invalidate হয়ে গেলেও) কখনো clear হওয়ার সুযোগ পায় না —
     * `/login`-এ যাওয়ার প্রতিটা চেষ্টা silently `/`-এ bounce হয়ে
     * থাকে, ব্যবহারকারী login form-ই কখনো দেখতে পায় না।
     *
     * `/platform/dashboard`-এ পাঠালে AuthGate (existing, অপরিবর্তিত)
     * প্রকৃত session validate করে: valid হলে dashboard দেখাবে; stale
     * হলে refresh route নিজেই cookie clear করবে (refresh/route.ts-এর
     * বিদ্যমান 401 handling) এবং AuthGate নিজে থেকেই `/login`-এ পাঠাবে
     * — এরপর `/login` normally render হবে।
     */
    return NextResponse.redirect(new URL("/platform/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
