"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  accessTokenRefreshed,
  authenticationStarted,
  loggedOut,
  sessionRestored,
} from "@/store/slices/auth.slice";
import { useLazyGetMeQuery, useRefreshSessionMutation } from "@/features/auth/api/auth.api";

/**
 * Protected route group-এর layout-এ (Phase 2) এটা wrap করা হবে। Redux
 * memory-তে access token কখনো persist হয় না, তাই প্রতিটি fresh page
 * load-এ silently /api/auth/refresh কল করে session restore করে — এই
 * সময়টুকু dashboard flash না করে একটা minimal shell দেখায় (section 17, 20)।
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector((state) => state.auth.status);
  const [refreshSession] = useRefreshSessionMutation();
  const [getMe] = useLazyGetMeQuery();

  useEffect(() => {
    if (status !== "idle") return;

    dispatch(authenticationStarted());

    void (async () => {
      const refreshResult = await refreshSession();

      if (!refreshResult.data) {
        dispatch(loggedOut());
        return;
      }

      const { accessToken } = refreshResult.data;
      dispatch(accessTokenRefreshed({ accessToken }));

      const meResult = await getMe();

      if (meResult.data) {
        dispatch(sessionRestored({ accessToken, user: meResult.data.user }));
      } else {
        dispatch(loggedOut());
      }
    })();
  }, [status, dispatch, refreshSession, getMe]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return <>{children}</>;
  }

  // idle/authenticating (silent refresh in flight) — এবং unauthenticated
  // (redirect তখনো ঘটছে, above effect-এ) — দুটো ক্ষেত্রেই protected
  // content flash হবে না।
  return <AppShellSkeleton />;
}

function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen flex-col gap-4 p-6">
      <Skeleton className="h-10 w-48" />
      <div className="flex gap-4">
        <Skeleton className="h-[calc(100vh-8rem)] w-56" />
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
