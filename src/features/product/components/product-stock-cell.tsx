"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { useListStockReportQuery } from "@/features/stock-report/api/stock-report.api";
import type { Product } from "@/types/product";

function StockValue({ companyId, product }: { companyId: string; product: Product }) {
  const t = useTranslations("products");

  // Same args as ProductStockDialog, so both share one RTK Query cache entry.
  const { data, isLoading, error } = useListStockReportQuery({
    companyId,
    productId: product.id,
    limit: 200,
  });

  const items = useMemo(() => data?.items ?? [], [data]);

  const totalStock = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items],
  );
  const hasLowStock = useMemo(() => items.some((item) => item.belowReorderLevel), [items]);

  if (isLoading) {
    return <Skeleton className="h-5 w-12" />;
  }

  if (error) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 tabular-nums">
      <span className={totalStock <= 0 ? "text-muted-foreground" : "font-medium"}>
        {totalStock.toLocaleString()}
      </span>
      {hasLowStock && (
        <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning">
          {t("stock.lowStock")}
        </Badge>
      )}
    </span>
  );
}

export function ProductStockCell({
  companyId,
  product,
}: {
  companyId: string;
  product: Product;
}) {
  return (
    <CompanyPermissionGate
      permission={COMPANY_PERMISSIONS.REPORT_READ}
      fallback={<span className="text-muted-foreground">—</span>}
    >
      <StockValue companyId={companyId} product={product} />
    </CompanyPermissionGate>
  );
}