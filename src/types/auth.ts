/**
 * এই shapes NestJS backend-এর প্রকৃত response mirror করে —
 * dotskills-sass-backend/src/modules/auth/auth.service.ts এবং
 * src/common/types/authenticated-user.type.ts থেকে verify করা,
 * frontend-এ কোনো field invent করা হয়নি।
 */
export interface AuthenticatedUser {
  userId: string;
  sessionId: string;
  platformMemberId?: string;
  email: string;
  fullName: string;
  preferredLocale: string;
  timezone: string;
  roles: string[];
}

/** POST /auth/staff/login-এর user object-এ শুধু এই দুটো extra field থাকে। */
export interface PlatformStaffUser extends AuthenticatedUser {
  userType: "PLATFORM_STAFF";
  permissions: string[];
}

export type CurrentUser = AuthenticatedUser | PlatformStaffUser;

export function isPlatformStaffUser(
  user: CurrentUser,
): user is PlatformStaffUser {
  return "userType" in user && user.userType === "PLATFORM_STAFF";
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceId?: string;
  /** কোন backend endpoint কল হবে তা নির্বাচন করে — /auth/login বা /auth/staff/login। */
  loginType: "company" | "staff";
}

/** BFF /api/auth/login ও /api/auth/refresh route-এর client-facing response — refreshToken কখনো এখানে থাকে না। */
export interface SessionResult {
  accessToken: string;
  tokenType: "Bearer";
  accessTokenExpiresIn: number;
  user?: CurrentUser;
}
