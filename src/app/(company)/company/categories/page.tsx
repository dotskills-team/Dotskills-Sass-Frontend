"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListCategoriesQuery } from "@/features/category/api/category.api";
import { CreateCategoryDialog } from "@/features/category/components/create-category-dialog";
import { CategoryRowActions } from "@/features/category/components/category-actions";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: categories, isLoading, error, refetch } = useListCategoriesQuery(companyId ?? "", {
    skip: !companyId,
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CATEGORY_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">
          {companyId && <CreateCategoryDialog companyId={companyId} categories={categories ?? []} />}
        </div>

        {!companyId || isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !categories || categories.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.parent")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const parent = categories.find((candidate) => candidate.id === category.parentCategoryId);
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{parent ? parent.name : "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={category.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <CategoryRowActions companyId={companyId} category={category} categories={categories} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </CompanyPermissionGate>
  );
}
