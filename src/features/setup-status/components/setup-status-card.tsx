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
    return <Skeleton className="h-48 w-full" />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
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
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <PartyPopper className="size-8 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="font-heading text-base font-semibold text-foreground">
                {t("progress.businessReadyTitle")}
              </p>
              <p className="text-sm text-muted-foreground">{t("progress.allDoneDescription")}</p>
            </div>
          </div>
          <Button onClick={handleStartBusiness} className="shrink-0">
            {t("progress.startBusiness")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{t("progress.title")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t("progress.description")}</p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {t("progress.completedOf", { completed: completedCount, total: totalCount })}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
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
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div className="flex min-w-0 items-center gap-3">
        {completed ? (
          <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
        ) : (
          <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
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
            <Button asChild size="sm" variant="outline">
              <Link href="/company/setup">{t("progress.actionButton")}</Link>
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
