"use client";

import { useTranslations } from "next-intl";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { SubscriptionActions } from "@/features/company-subscription/components/subscription-actions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { CompanySubscriptionCurrent } from "@/types/company-subscription";

export function CurrentSubscriptionCard({ subscription }: { subscription: CompanySubscriptionCurrent }) {
  const t = useTranslations("companySubscription");

  return (
    <section className="rounded-lg border border-border p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-medium text-foreground">{subscription.plan.name}</h2>
          <p className="text-xs text-muted-foreground">{subscription.plan.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={subscription.status} />
          {subscription.autoRenew ? (
            <Badge variant="outline">{t("autoRenewOn")}</Badge>
          ) : (
            <Badge variant="outline">{t("autoRenewOff")}</Badge>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">{t("billingCycle")}</dt>
          <dd className="text-foreground">{subscription.billingCycle}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("price")}</dt>
          <dd className="font-semibold text-foreground">
            {formatCurrency(subscription.priceSnapshot.amount, subscription.priceSnapshot.currencyCode)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("currentPeriod")}</dt>
          <dd className="text-foreground">
            {formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("startsAt")}</dt>
          <dd className="text-foreground">{formatDate(subscription.startsAt)}</dd>
        </div>

        {subscription.trialEndsAt && (
          <div>
            <dt className="text-muted-foreground">{t("trialEndsAt")}</dt>
            <dd className="text-foreground">{formatDate(subscription.trialEndsAt)}</dd>
          </div>
        )}
        {subscription.graceEndsAt && (
          <div>
            <dt className="text-muted-foreground">{t("graceEndsAt")}</dt>
            <dd className="text-foreground">{formatDate(subscription.graceEndsAt)}</dd>
          </div>
        )}
        {subscription.pastDueEndsAt && (
          <div>
            <dt className="text-muted-foreground">{t("pastDueEndsAt")}</dt>
            <dd className="text-foreground">{formatDate(subscription.pastDueEndsAt)}</dd>
          </div>
        )}
        {subscription.suspendedAt && (
          <div>
            <dt className="text-muted-foreground">{t("suspendedAt")}</dt>
            <dd className="text-foreground">{formatDate(subscription.suspendedAt)}</dd>
          </div>
        )}
        {subscription.cancelledAt && (
          <div>
            <dt className="text-muted-foreground">{t("cancelledAt")}</dt>
            <dd className="text-foreground">{formatDate(subscription.cancelledAt)}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 border-t border-border pt-4">
        <SubscriptionActions subscription={subscription} />
      </div>
    </section>
  );
}
