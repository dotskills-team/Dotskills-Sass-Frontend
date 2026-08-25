import type { CurrentUser } from "@/types/auth";

export type UserScope = "platform" | "company";

/**
 * Backend-এর refresh-token JWT payload-এ কোনো role/scope claim নেই (শুধু
 * access token-এ থাকে, এবং access token শুধু login/getMe response-এর পরেই
 * পাওয়া যায়) — তাই proxy.ts থেকে scope নির্ধারণ সম্ভব না। এখানে
 * client-side, hydrated `user` object থেকে সিদ্ধান্ত নেওয়া হয়, backend-এর
 * প্রকৃত response field ব্যবহার করে (invent করা কিছু নয়):
 *
 *   - `platformMemberId` শুধু তখনই set হয় যখন ওই user platform member
 *     (দেখুন jwt.strategy.ts / auth.service.ts, `toAuthenticatedUser`)।
 *   - `roles` platform role code-এর array, exclusively
 *     `user.platformMember?.roles` থেকে derive করা (auth.service.ts-এর
 *     `activeRoleCodes()`), company role এখানে কখনো আসে না।
 *
 * Backend-এ `/auth/login` (non-staff) endpoint প্ল্যাটফর্ম member-দেরও
 * সফল login দিতে পারে (`hasActiveMembership` guard, `hasActivePlatformMembership`
 * নয়) — তাই client-এ কোন লগইন বাটন চাপা হয়েছিল তার উপর নির্ভর না করে,
 * সবসময় প্রকৃত returned user data থেকেই scope resolve করা হয়।
 */
export function resolveUserScope(user: CurrentUser): UserScope {
  return user.platformMemberId || user.roles.length > 0 ? "platform" : "company";
}

export function dashboardPathForScope(scope: UserScope): string {
  return scope === "platform" ? "/platform/dashboard" : "/company/dashboard";
}

/**
 * `redirectTo` proxy.ts-এর protected-route bounce থেকে আসে (verified
 * src/proxy.ts) — এটা এই user-এর scope-এর সাথে সম্পর্ক যাচাই ছাড়াই
 * ব্যবহার করা ঠিক না। উদাহরণ: একজন Company user যদি আগের কোনো
 * `/platform/...` bounce-এর leftover `redirectTo` নিয়ে login করে, সরাসরি
 * platform route-এ চলে যাবে — route group layout URL অনুযায়ী রেন্ডার হয়
 * (এই login-এর প্রকৃত scope অনুযায়ী না), ফলে platform sidebar/nav দেখা
 * যাবে। `redirectTo` তাই শুধু তখনই honor করা হয় যখন সেটা resolved
 * scope-এর নিজের route prefix-এর সাথে মেলে।
 */
export function resolveRedirectTarget(scope: UserScope, redirectTo: string | null): string {
  const scopePrefix = scope === "platform" ? "/platform" : "/company";
  return redirectTo && redirectTo.startsWith(scopePrefix) ? redirectTo : dashboardPathForScope(scope);
}
