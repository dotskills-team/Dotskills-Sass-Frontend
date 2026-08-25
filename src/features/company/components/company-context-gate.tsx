"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Building2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetMyCompaniesQuery } from "@/features/company/api/company.api";
import { switchCompany } from "@/features/company/actions";
import { selectCurrentCompany } from "@/features/company/lib/select-current-company";

/**
 * `AuthGate` শুধু "authenticated কিনা" নিশ্চিত করে — `x-company-id`
 * header-এর জন্য প্রয়োজনীয় company context এখনো ready কিনা সেটা আলাদা।
 * এই দুটো readiness আগে conflate করা ছিল না — Redux `company.currentCompanyId`
 * প্রতি full page load-এ `null`-এ reset হয় (persist হয় না), অথচ company-scoped
 * page-গুলো (invoices/subscription/payments) কোনো `skip` গার্ড ছাড়াই নিজেদের
 * query সরাসরি mount-এ fire করত — `CompanySelector`-এর নিজস্ব
 * `useGetMyCompaniesQuery()` resolve হয়ে auto-select dispatch করার আগেই।
 * ফলাফল: intermittent "x-company-id header is required" (base-api.ts-এর
 * `prepareHeaders` তখনো `currentCompanyId === null` দেখে header বসায়নি),
 * বিশেষ করে SSLCommerz success redirect-এর মতো cold full-page-load-এ, যেখানে
 * পুরো app-ই fresh mount হয়।
 *
 * এই gate সেই race architecturally বন্ধ করে: company context সম্পূর্ণ ready
 * না হওয়া পর্যন্ত protected children-ই mount হয় না, তাই তাদের কোনো
 * company-scoped query কখনো `currentCompanyId` ছাড়া fire হতে পারে না।
 * Auto-select logic-ও এখানে single source of truth হিসেবে move করা হলো
 * (আগে `CompanySelector`-এ duplicate ছিল)।
 */
export function CompanyContextGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations("company");
  const dispatch = useAppDispatch();
  const currentCompanyId = useAppSelector((state) => state.company.currentCompanyId);
  const { data: companies, isLoading, isError, error, refetch } = useGetMyCompaniesQuery();

  useEffect(() => {
    if (!currentCompanyId && companies?.length === 1) {
      dispatch(switchCompany(companies[0].companyId));
    }
  }, [companies, currentCompanyId, dispatch]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!companies || companies.length === 0) {
    return <EmptyState title={t("noCompaniesFound")} />;
  }

  const current = selectCurrentCompany(companies, currentCompanyId);

  if (!current) {
    return <EmptyState title={t("selectCompanyPrompt")} icon={Building2} />;
  }

  return <>{children}</>;
}
