// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useTranslations } from "next-intl";
// import { CheckCircle2, Circle, Clock, PartyPopper, RefreshCw } from "lucide-react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";

// import { useGetSetupStatusQuery } from "@/features/setup-status/api/setup-status.api";
// import { isPlatformDependentCheck } from "@/features/setup-status/lib/setup-status-config";
// import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
// import { normalizeApiError } from "@/lib/api-error";
// import type { SetupCheckKey } from "@/types/setup-status";

// function dismissedStorageKey(companyId: string) {
//   return `dotskills:setup-status-dismissed:${companyId}`;
// }

// /**
//  * Backend (`GET /companies/:companyId/setup-status`) is the single source
//  * of truth for both *what's* complete and the overall count — this
//  * component only decides how to *present* each key (which i18n copy, which
//  * icon, whether a pending item gets an action button or a "Platform Admin"
//  * badge). It never recomputes completion itself.
//  *
//  * Self-contained (resolves its own `companyId` via `useCurrentCompany()`,
//  * same self-fetching pattern as `ProfileMenu`/`NotificationBell`) so it can
//  * be dropped into a Server Component dashboard page without prop drilling.
//  *
//  * Supersedes the old frontend-only `SetupIncompleteBanner` heuristic
//  * (zero-Locations guess) — this is the real, accurate 5-check status.
//  *
//  * "Start Your Business" only ever hides this *card* (a per-browser
//  * localStorage preference, re-shown again on another device/browser) — it
//  * never marks setup complete itself. Completion is decided exclusively by
//  * the backend's `isComplete` flag; if that ever goes false again (should
//  * never happen for these 5 monotonic checks, but defensively handled), the
//  * dismiss flag is ignored and the real checklist reappears.
//  */
// export function SetupStatusCard() {
//   const t = useTranslations("setupWizard");
//   const { company } = useCurrentCompany();
//   const companyId = company?.companyId;
//   const { data, isLoading, error, refetch } = useGetSetupStatusQuery(companyId ?? "", {
//     skip: !companyId,
//   });

//   // Re-render trigger only — the actual dismissed value is re-read from
//   // localStorage on every render (a synchronous, side-effect-free read),
//   // never synced into state via an effect.
//   const [, forceRerender] = useState(0);
//   const dismissed = (() => {
//     if (!companyId) return false;
//     try {
//       return localStorage.getItem(dismissedStorageKey(companyId)) === "1";
//     } catch {
//       return false;
//     }
//   })();

//   if (!companyId || isLoading) {
//     return <Skeleton className="h-48 w-full" />;
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
//           <p className="text-sm text-muted-foreground">{normalizeApiError(error).message}</p>
//           <Button variant="outline" size="sm" onClick={() => refetch()}>
//             <RefreshCw className="size-4" aria-hidden="true" />
//             {t("progress.retry")}
//           </Button>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (!data) return null;

//   const { completedCount, totalCount, isComplete, checks } = data;
//   const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

//   function handleStartBusiness() {
//     if (!companyId) return;
//     try {
//       localStorage.setItem(dismissedStorageKey(companyId), "1");
//     } catch {
//       // Storage blocked — the card just won't stay dismissed on refresh; non-fatal.
//     }
//     forceRerender((n) => n + 1);
//   }

//   if (isComplete && dismissed) {
//     return null;
//   }

//   if (isComplete) {
//     return (
//       <Card className="border-success/30 bg-success/5">
//         <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
//           <div className="flex items-center gap-3">
//             <PartyPopper className="size-8 shrink-0 text-success" aria-hidden="true" />
//             <div>
//               <p className="font-heading text-base font-semibold text-foreground">
//                 {t("progress.businessReadyTitle")}
//               </p>
//               <p className="text-sm text-muted-foreground">{t("progress.allDoneDescription")}</p>
//             </div>
//           </div>
//           <Button onClick={handleStartBusiness} className="shrink-0">
//             {t("progress.startBusiness")}
//           </Button>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <CardTitle>{t("progress.title")}</CardTitle>
//           <p className="mt-1 text-sm text-muted-foreground">{t("progress.description")}</p>
//         </div>
//         <Badge variant="outline" className="shrink-0">
//           {t("progress.completedOf", { completed: completedCount, total: totalCount })}
//         </Badge>
//       </CardHeader>

//       <CardContent className="space-y-4">
//         <div className="h-2 overflow-hidden rounded-full bg-muted">
//           <div
//             className="h-full rounded-full bg-primary transition-all"
//             style={{ width: `${percent}%` }}
//           />
//         </div>

//         <ul className="space-y-2">
//           {checks.map((check) => (
//             <SetupCheckRow key={check.key} checkKey={check.key} completed={check.completed} />
//           ))}
//         </ul>
//       </CardContent>
//     </Card>
//   );
// }

// function SetupCheckRow({ checkKey, completed }: { checkKey: SetupCheckKey; completed: boolean }) {
//   const t = useTranslations("setupWizard");
//   const isPlatformDependent = isPlatformDependentCheck(checkKey);

//   return (
//     <li className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
//       <div className="flex min-w-0 items-center gap-3">
//         {completed ? (
//           <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
//         ) : (
//           <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
//         )}
//         <div className="min-w-0">
//           <p className="text-sm font-medium text-foreground">{t(`progress.items.${checkKey}.label`)}</p>
//           {!completed && (
//             <p className="truncate text-xs text-muted-foreground">
//               {t(`progress.items.${checkKey}.description`)}
//             </p>
//           )}
//         </div>
//       </div>

//       {!completed && (
//         <div className="shrink-0">
//           {isPlatformDependent ? (
//             <Badge variant="secondary" className="whitespace-nowrap">
//               <Clock className="size-3" aria-hidden="true" />
//               {t("progress.platformPendingBadge")}
//             </Badge>
//           ) : (
//             <Button asChild size="sm" variant="outline">
//               <Link href="/company/setup">{t("progress.actionButton")}</Link>
//             </Button>
//           )}
//         </div>
//       )}
//     </li>
//   );
// }
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, Clock, PartyPopper, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetSetupStatusQuery } from "@/features/setup-status/api/setup-status.api";
import { isPlatformDependentCheck } from "@/features/setup-status/lib/setup-status-config";
import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { normalizeApiError } from "@/lib/api-error";
import type { SetupCheckKey } from "@/types/setup-status";

/* UI ONLY — shared glass surface for this card's states */
const GLASS_CARD =
  "rounded-2xl border-border/60 bg-card/70 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgb(40_20_120/0.22)]";

function dismissedStorageKey(companyId: string) {
  return `dotskills:setup-status-dismissed:${companyId}`;
}

/**
 * Backend (`GET /companies/:companyId/setup-status`) is the single source
 * of truth for both *what's* complete and the overall count — this
 * component only decides how to *present* each key (which i18n copy, which
 * icon, whether a pending item gets an action button or a "Platform Admin"
 * badge). It never recomputes completion itself.
 *
 * Self-contained (resolves its own `companyId` via `useCurrentCompany()`,
 * same self-fetching pattern as `ProfileMenu`/`NotificationBell`) so it can
 * be dropped into a Server Component dashboard page without prop drilling.
 *
 * Supersedes the old frontend-only `SetupIncompleteBanner` heuristic
 * (zero-Locations guess) — this is the real, accurate 5-check status.
 *
 * "Start Your Business" only ever hides this *card* (a per-browser
 * localStorage preference, re-shown again on another device/browser) — it
 * never marks setup complete itself. Completion is decided exclusively by
 * the backend's `isComplete` flag; if that ever goes false again (should
 * never happen for these 5 monotonic checks, but defensively handled), the
 * dismiss flag is ignored and the real checklist reappears.
 */
export function SetupStatusCard() {
  const t = useTranslations("setupWizard");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;
  const { data, isLoading, error, refetch } = useGetSetupStatusQuery(companyId ?? "", {
    skip: !companyId,
  });

  // Re-render trigger only — the actual dismissed value is re-read from
  // localStorage on every render (a synchronous, side-effect-free read),
  // never synced into state via an effect.
  const [, forceRerender] = useState(0);
  const dismissed = (() => {
    if (!companyId) return false;
    try {
      return localStorage.getItem(dismissedStorageKey(companyId)) === "1";
    } catch {
      return false;
    }
  })();

  if (!companyId || isLoading) {
    /* UI ONLY — rounded skeleton */
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (error) {
    return (
      <Card className={GLASS_CARD}>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          {/* UI ONLY — icon tile */}
          <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <RefreshCw className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">{normalizeApiError(error).message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t("progress.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { completedCount, totalCount, isComplete, checks } = data;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function handleStartBusiness() {
    if (!companyId) return;
    try {
      localStorage.setItem(dismissedStorageKey(companyId), "1");
    } catch {
      // Storage blocked — the card just won't stay dismissed on refresh; non-fatal.
    }
    forceRerender((n) => n + 1);
  }

  if (isComplete && dismissed) {
    return null;
  }

  if (isComplete) {
    return (
      /* UI ONLY — success state: soft green→cyan wash with glass */
      <Card className="rounded-2xl border-success/30 bg-gradient-to-br from-success/10 via-card/70 to-info/10 shadow-[0_8px_32px_-12px_rgb(20_120_80/0.25)] backdrop-blur-xl">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success ring-1 ring-success/25">
              <PartyPopper className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-base font-semibold tracking-tight text-foreground">
                {t("progress.businessReadyTitle")}
              </p>
              <p className="text-sm text-muted-foreground">{t("progress.allDoneDescription")}</p>
            </div>
          </div>
          <Button
            onClick={handleStartBusiness}
            className="btn-glow shrink-0 bg-gradient-to-r from-primary to-info text-primary-foreground"
          >
            {t("progress.startBusiness")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={GLASS_CARD}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="tracking-tight">{t("progress.title")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t("progress.description")}</p>
        </div>
        <Badge variant="outline" className="shrink-0 border-primary/30 bg-primary/10 text-primary tabular-nums">
          {t("progress.completedOf", { completed: completedCount, total: totalCount })}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* UI ONLY — glowing gradient progress bar (aria attributes are additive, a11y only) */}
        <div
          className="h-2 overflow-hidden rounded-full bg-muted ring-1 ring-border/50"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-info shadow-[0_0_14px_color-mix(in_oklab,var(--color-primary)_70%,transparent)] transition-all duration-500 motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>

        <ul className="space-y-2">
          {checks.map((check) => (
            <SetupCheckRow key={check.key} checkKey={check.key} completed={check.completed} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SetupCheckRow({ checkKey, completed }: { checkKey: SetupCheckKey; completed: boolean }) {
  const t = useTranslations("setupWizard");
  const isPlatformDependent = isPlatformDependentCheck(checkKey);

  return (
    /* UI ONLY — row: translucent surface, lifts border on hover */
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 p-3 transition-colors duration-200 hover:border-primary/30 hover:bg-card/80 motion-reduce:transition-none">
      <div className="flex min-w-0 items-center gap-3">
        {completed ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Circle className="size-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{t(`progress.items.${checkKey}.label`)}</p>
          {!completed && (
            <p className="truncate text-xs text-muted-foreground">
              {t(`progress.items.${checkKey}.description`)}
            </p>
          )}
        </div>
      </div>

      {!completed && (
        <div className="shrink-0">
          {isPlatformDependent ? (
            <Badge variant="secondary" className="whitespace-nowrap">
              <Clock className="size-3" aria-hidden="true" />
              {t("progress.platformPendingBadge")}
            </Badge>
          ) : (
            <Button asChild size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              <Link href="/company/setup">{t("progress.actionButton")}</Link>
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
