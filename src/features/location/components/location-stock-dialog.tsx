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
import type { Location } from "@/types/location";

/** Location-primary view of the Location-wise Stock Visibility micro-chunk — every Product's quantity at this one Location, capped at 200 rows. Unlike the Product->Locations direction, a large catalog could genuinely exceed this cap — the truncation notice below makes that explicit rather than silently hiding it. */
export function LocationStockDialog({
  companyId,
  location,
  open,
  onOpenChange,
}: {
  companyId: string;
  location: Location;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("locations");

  const { data, isLoading, error, refetch } = useListStockReportQuery(
    { companyId, locationId: location.id, limit: 200 },
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
          <DialogTitle>{t("stock.title", { name: location.name })}</DialogTitle>
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
                  <TableHead>{t("stock.columns.product")}</TableHead>
                  <TableHead>{t("stock.columns.sku")}</TableHead>
                  <TableHead className="text-right">{t("stock.columns.quantity")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.product.sku}</TableCell>
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
