"use client";

import { Building2, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetMyCompaniesQuery } from "@/features/company/api/company.api";
import { switchCompany } from "@/features/company/actions";

/**
 * শুধু presentational/manual-switch — একমাত্র company থাকলে auto-select
 * করার logic এখন `CompanyContextGate`-এ single source of truth হিসেবে
 * move করা হয়েছে (duplicate effect avoid করতে)।
 */
export function CompanySelector() {
  const t = useTranslations("company");
  const dispatch = useAppDispatch();
  const currentCompanyId = useAppSelector((state) => state.company.currentCompanyId);
  const { data: companies, isLoading } = useGetMyCompaniesQuery();

  if (isLoading) {
    return <Skeleton className="h-9 w-40" />;
  }

  if (!companies || companies.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noCompaniesFound")}</p>;
  }

  const current = companies.find((c) => c.companyId === currentCompanyId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="max-w-56 justify-between">
          <span className="flex items-center gap-2 truncate">
            <Building2 className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{current?.companyName ?? t("selectCompany")}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{t("yourCompanies")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((c) => (
          <DropdownMenuItem
            key={c.companyId}
            onSelect={() => dispatch(switchCompany(c.companyId))}
            className={c.companyId === currentCompanyId ? "font-medium" : undefined}
          >
            {c.companyName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
