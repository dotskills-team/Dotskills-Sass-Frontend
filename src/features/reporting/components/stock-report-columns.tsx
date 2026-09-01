"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { StockReportEntry } from "@/types/stock-report";

export function buildStockReportColumns(labels: {
  product: string;
  sku: string;
  location: string;
  quantity: string;
  lowStock: string;
}): ColumnDef<AppTableFeatures, StockReportEntry, unknown>[] {
  return [
    {
      accessorKey: "product",
      header: labels.product,
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          {row.original.product.name}
          {row.original.belowReorderLevel && (
            <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning">
              {labels.lowStock}
            </Badge>
          )}
        </span>
      ),
    },
    {
      id: "sku",
      header: labels.sku,
      cell: ({ row }) => row.original.product.sku,
    },
    {
      id: "location",
      header: labels.location,
      cell: ({ row }) => row.original.location.name,
    },
    {
      accessorKey: "quantity",
      header: labels.quantity,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.quantity).toLocaleString()}</span>,
    },
  ];
}
