"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { CreateCompanyOwnerDialog } from "@/features/company-owner/components/create-company-owner-dialog";
import { CompanyOwnerRowActions } from "@/features/company-owner/components/company-owner-actions";
import { useListCompanyOwnersQuery } from "@/features/company-owner/api/company-owner.api";

/** Company Details page-এর Owner section — Plan Details-এর PlanPricingSection/PlanFeaturesSection pattern reuse। */
export function CompanyOwnersSection({ companyId }: { companyId: string }) {
  const t = useTranslations("companyOwners");
  const { data: owners, isLoading, error, refetch } = useListCompanyOwnersQuery(companyId);
  const primaryOwner = owners?.find((ownership) => ownership.isPrimary);

  return (
    <section className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-heading text-base font-medium text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <CreateCompanyOwnerDialog companyId={companyId} />
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !owners || owners.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <>
            {primaryOwner && (
              <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="mb-2 text-xs font-medium tracking-wide text-primary uppercase">
                  {t("primary")} {t("title")}
                </p>
                <p className="text-base font-semibold text-foreground">
                  {primaryOwner.companyMember.user.fullName}
                </p>
                <p className="text-sm text-muted-foreground">{primaryOwner.companyMember.user.email}</p>
                <div className="mt-2">
                  <StatusBadge status={primaryOwner.companyMember.status} />
                </div>
              </div>
            )}
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.designation")}</TableHead>
                <TableHead>{t("columns.primary")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((ownership, index) => (
                <TableRow key={ownership.id}>
                  <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">{ownership.companyMember.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{ownership.companyMember.user.email}</p>
                  </TableCell>
                  <TableCell>{ownership.companyMember.designation ?? "—"}</TableCell>
                  <TableCell>
                    {ownership.isPrimary ? (
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                        {t("primary")}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ownership.companyMember.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <CompanyOwnerRowActions companyId={companyId} ownership={ownership} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </>
        )}
      </div>
    </section>
  );
}
