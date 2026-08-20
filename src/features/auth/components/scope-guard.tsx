"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/store/hooks";
import { resolveUserScope, type UserScope } from "@/features/auth/lib/scope";

/**
 * AuthGate ইতিমধ্যে "authenticated কিনা" নিশ্চিত করে — এটা শুধু
 * "সঠিক scope-এ আছে কিনা" (section 14) দেখে। একজন company user
 * /platform/* খুলতে পারবে না এবং উল্টোটাও না — client-side, UX-level;
 * প্রকৃত authorization backend guard-গুলোই করে (অপরিবর্তিত)।
 */
export function ScopeGuard({
  requiredScope,
  children,
}: {
  requiredScope: UserScope;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const scope = user ? resolveUserScope(user) : null;
  const isAllowed = scope === requiredScope;

  useEffect(() => {
    if (user && !isAllowed) {
      router.replace("/unauthorized");
    }
  }, [user, isAllowed, router]);

  if (!user || !isAllowed) {
    return null;
  }

  return <>{children}</>;
}
