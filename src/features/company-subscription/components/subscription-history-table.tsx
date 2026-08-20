"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { useListCompanySubscriptionsQuery } from "@/features/company-subscription/api/company-subscription.api";

/** Backend `GET /subscriptions` raw array, কোনো pagination নেই, সর্বোচ্চ ১০০টা row (verified) — তাই কোনো pagination UI নেই। */
export function SubscriptionHistoryTable() {
  const t = useTranslations("companySubscription");
  const { data, isLoading, error, refetch } = useListCompanySubscriptionsQuery();

  return (
    <section className="rounded-lg border border-border">
      <div className="border-b border-border p-4">
        <h2 className="font-heading text-base font-medium text-foreground">{t("history.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("history.description")}</p>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title={t("history.empty")} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t("history.columns.plan")}</TableHead>
                <TableHead>{t("history.columns.cycle")}</TableHead>
                <TableHead>{t("history.columns.price")}</TableHead>
                <TableHead>{t("history.columns.period")}</TableHead>
                <TableHead>{t("history.columns.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((subscription, index) => (
                <TableRow key={subscription.id}>
                  <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                  <TableCell>
                    <Link href={`/company/subscription/${subscription.id}`} className="hover:underline">
                      <p className="font-medium text-foreground">{subscription.plan.name}</p>
                      <p className="text-xs text-muted-foreground">{subscription.plan.code}</p>
                    </Link>
                  </TableCell>
                  <TableCell>{subscription.billingCycle}</TableCell>
                  <TableCell>
                    {formatCurrency(subscription.priceSnapshot.amount, subscription.priceSnapshot.currencyCode)}
                  </TableCell>
                  <TableCell>
                    {formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={subscription.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
