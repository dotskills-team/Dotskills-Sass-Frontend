"use client";

import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

import { useListStockReportQuery } from "@/features/stock-report/api/stock-report.api";
import type { Product } from "@/types/product";

/** Product-primary view of the Location-wise Stock Visibility micro-chunk — every Location's quantity for this one Product, capped at 200 rows (a shop's Location count is naturally small, so this is complete in practice). */
export function ProductStockDialog({
  companyId,
  product,
  open,
  onOpenChange,
}: {
  companyId: string;
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("products");

  const { data, isLoading, error, refetch } = useListStockReportQuery(
    { companyId, productId: product.id, limit: 200 },
    { skip: !open || !companyId },
  );

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const limit = data?.meta?.limit ?? 200;
  const isTruncated = total > limit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("stock.title", { name: product.name })}</DialogTitle>
          <DialogDescription>{t("stock.description")}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState title={t("stock.empty")} />
        ) : (
          <div className="space-y-3">
            {isTruncated && (
              <Alert>
                <AlertDescription>{t("stock.truncatedNotice", { shown: items.length, total })}</AlertDescription>
              </Alert>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("stock.columns.location")}</TableHead>
                  <TableHead className="text-right">{t("stock.columns.quantity")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.location.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="inline-flex items-center gap-2">
                        {Number(item.quantity).toLocaleString()}
                        {item.belowReorderLevel && (
                          <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning">
                            {t("stock.lowStock")}
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
