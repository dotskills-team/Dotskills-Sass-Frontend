"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { ProfitReportEntry } from "@/types/profit-report";

export function buildProfitReportColumns(labels: {
  date: string;
  saleCount: string;
  revenue: string;
  cogs: string;
  grossProfit: string;
}): ColumnDef<AppTableFeatures, ProfitReportEntry, unknown>[] {
  return [
    {
      accessorKey: "date",
      header: labels.date,
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "saleCount",
      header: labels.saleCount,
      cell: ({ row }) => <span className="tabular-nums">{row.original.saleCount}</span>,
    },
    {
      accessorKey: "revenue",
      header: labels.revenue,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.revenue).toLocaleString()}</span>,
    },
    {
      accessorKey: "cogs",
      header: labels.cogs,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.cogs).toLocaleString()}</span>,
    },
    {
      accessorKey: "grossProfit",
      header: labels.grossProfit,
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">{Number(row.original.grossProfit).toLocaleString()}</span>
      ),
    },
  ];
}
