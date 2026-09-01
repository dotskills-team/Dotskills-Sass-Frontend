"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListProductsQuery } from "@/features/product/api/product.api";
import { useListCategoriesQuery } from "@/features/category/api/category.api";
import { useListUnitsQuery } from "@/features/unit/api/unit.api";
import { CreateProductDialog } from "@/features/product/components/create-product-dialog";
import { buildProductsColumns } from "@/features/product/components/products-columns";
import { BulkImportDialog } from "@/features/bulk-import/components/bulk-import-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

/** The one Master Data list that's paginated (backend Phase 6 pagination addition) — mirrors the Industries page's DataTable + DataTablePagination pattern exactly. */
export default function ProductsPage() {
  const t = useTranslations("products");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400).trim();

  const [page, setPage] = useState(1);
  // Reset to page 1 whenever the search term changes, without a
  // setState-in-effect (React's "adjust state during render" escape
  // hatch, same class of fix as the POS location auto-select).
  const [lastSearch, setLastSearch] = useState(debouncedSearch);
  if (debouncedSearch !== lastSearch) {
    setLastSearch(debouncedSearch);
    setPage(1);
  }

  const { data, isLoading, isFetching, error, refetch } = useListProductsQuery(
    { companyId: companyId ?? "", page, search: debouncedSearch || undefined },
    { skip: !companyId },
  );
  const { data: categories } = useListCategoriesQuery(companyId ?? "", { skip: !companyId });
  const { data: units } = useListUnitsQuery(companyId ?? "", { skip: !companyId });

  const columns = companyId
    ? buildProductsColumns(companyId, categories ?? [], units ?? [], {
        product: t("columns.product"),
        category: t("columns.category"),
        unit: t("columns.unit"),
        salePrice: t("columns.salePrice"),
        reorderLevel: t("columns.reorderLevel"),
        status: t("columns.status"),
      })
    : [];

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PRODUCT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="max-w-xs"
          />
          {companyId && (
            <div className="flex gap-2">
              <BulkImportDialog companyId={companyId} />
              <CreateProductDialog companyId={companyId} categories={categories ?? []} units={units ?? []} />
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={!companyId || isLoading || isFetching}
          error={error}
          onRetry={refetch}
          pagination={data?.meta ?? undefined}
        />

        {data?.meta && data.meta.totalPages > 1 && (
          <DataTablePagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </CompanyPermissionGate>
  );
}
