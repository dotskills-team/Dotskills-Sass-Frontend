"use client";

import { useTranslations } from "next-intl";
import { Building2, CheckCircle2, CreditCard, FileText, Receipt, Wallet } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { UserGreeting } from "@/features/auth/components/user-greeting";

import { useListCompaniesQuery } from "@/features/company/api/company.api";
import { useListSubscriptionsQuery } from "@/features/subscription/api/subscription.api";
import { useListBillingsQuery } from "@/features/billing/api/billing.api";
import { useListInvoicesQuery } from "@/features/invoice/api/invoice.api";
import { useListPaymentsQuery } from "@/features/payment/api/payment.api";

/**
 * প্রতিটা card real backend data থেকে — কোনো fake statistic নেই।
 *
 * "Active Subscriptions" card-টা একটা সততার সাথে-disclosed সীমাবদ্ধতা
 * বহন করে: backend-এর `/platform/subscriptions` কোনো filter/pagination
 * সমর্থন করে না এবং সর্বোচ্চ ১০০টা row দেয় (verified) — তাই এই সংখ্যা
 * "সাম্প্রতিক ১০০টার মধ্যে active" (client-side filter করা), সব
 * company-র প্রকৃত মোট active subscription সংখ্যা নয়। বাকি সব card
 * সরাসরি backend-এর `meta.total` থেকে আসে (authoritative)।
 */
export default function PlatformDashboardPage() {
  const t = useTranslations("dashboard");

  const companies = useListCompaniesQuery({ limit: 1 });
  const activeCompanies = useListCompaniesQuery({ limit: 1, status: "LIVE" });
  const subscriptions = useListSubscriptionsQuery();
  const pendingBilling = useListBillingsQuery({ limit: 1, status: "PENDING" });
  const outstandingInvoices = useListInvoicesQuery({ limit: 1, status: "ISSUED" });
  const successfulPayments = useListPaymentsQuery({ limit: 1, status: "SUCCEEDED" });

  const activeSubscriptionsCount = subscriptions.data?.items.filter(
    (s) => s.status === "ACTIVE",
  ).length;

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <UserGreeting />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label={t("totalCompanies")}
            value={companies.data?.meta?.total ?? "—"}
            icon={Building2}
            isLoading={companies.isLoading}
          />
          <StatCard
            label={t("activeCompanies")}
            value={activeCompanies.data?.meta?.total ?? "—"}
            icon={CheckCircle2}
            isLoading={activeCompanies.isLoading}
          />
          <StatCard
            label={t("activeSubscriptions")}
            value={activeSubscriptionsCount ?? "—"}
            icon={CreditCard}
            isLoading={subscriptions.isLoading}
          />
          <StatCard
            label={t("pendingBilling")}
            value={pendingBilling.data?.meta?.total ?? "—"}
            icon={Receipt}
            isLoading={pendingBilling.isLoading}
          />
          <StatCard
            label={t("outstandingInvoices")}
            value={outstandingInvoices.data?.meta?.total ?? "—"}
            icon={FileText}
            isLoading={outstandingInvoices.isLoading}
          />
          <StatCard
            label={t("successfulPayments")}
            value={successfulPayments.data?.meta?.total ?? "—"}
            icon={Wallet}
            isLoading={successfulPayments.isLoading}
          />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{t("activeSubscriptionsCaveat")}</p>
      </div>
    </div>
  );
}
