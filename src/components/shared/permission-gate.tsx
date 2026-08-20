"use client";

import { hasAllPermissions, hasAnyPermission } from "@/lib/permissions";
import { useAppSelector } from "@/store/hooks";
import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { isPlatformStaffUser } from "@/types/auth";
import type { PlatformPermissionCode, CompanyPermissionCode } from "@/constants/permissions";

type GateMode = "any" | "all";

function evaluate(userPermissions: string[], required: string[], mode: GateMode): boolean {
  return mode === "all"
    ? hasAllPermissions(userPermissions, required)
    : hasAnyPermission(userPermissions, required);
}

interface PermissionGateProps<TCode extends string> {
  /** একাধিক code দিলে `mode` অনুযায়ী "যেকোনো একটা" বা "সবগুলো" লাগবে। */
  permission: TCode | TCode[];
  mode?: GateMode;
  /** Hide (default, null) না করে disable+tooltip দেখাতে চাইলে এখানে সেই UI দিন (section 13)। */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Platform scope — শুধু `PLATFORM_PERMISSIONS`-এর code নেয় (type-level
 * enforce করা), শুধুমাত্র platform staff login-এর response-এ পাওয়া
 * `user.permissions` ব্যবহার করে। এটা UX control মাত্র — actual
 * authorization backend guard-গুলোই করে, এখানে bypass হলেও backend
 * request reject করবে।
 */
export function PlatformPermissionGate({
  permission,
  mode = "any",
  fallback = null,
  children,
}: PermissionGateProps<PlatformPermissionCode>) {
  const user = useAppSelector((state) => state.auth.user);
  const userPermissions = user && isPlatformStaffUser(user) ? user.permissions : [];
  const required = Array.isArray(permission) ? permission : [permission];

  return evaluate(userPermissions, required, mode) ? <>{children}</> : <>{fallback}</>;
}

/** Company scope — `COMPANY_PERMISSIONS`-এর code নেয়, বর্তমান company-র effective permission (`useCurrentCompany`) ব্যবহার করে। */
export function CompanyPermissionGate({
  permission,
  mode = "any",
  fallback = null,
  children,
}: PermissionGateProps<CompanyPermissionCode>) {
  const { permissions } = useCurrentCompany();
  const required = Array.isArray(permission) ? permission : [permission];

  return evaluate(permissions, required, mode) ? <>{children}</> : <>{fallback}</>;
}
