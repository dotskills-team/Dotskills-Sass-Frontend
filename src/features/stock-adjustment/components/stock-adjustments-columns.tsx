"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { formatDateTime } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { StockAdjustmentBatch } from "@/types/stock-adjustment";

export function buildStockAdjustmentsColumns(labels: {
  id: string;
  createdAt: string;
}): ColumnDef<AppTableFeatures, StockAdjustmentBatch, unknown>[] {
  return [
    {
      accessorKey: "id",
      header: labels.id,
      cell: ({ row }) => (
        <Link
          href={`/company/stock-adjustments/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.id.slice(0, 8)}
        </Link>
      ),
    },
    {
      accessorKey: "createdAt",
      header: labels.createdAt,
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
  ];
}
