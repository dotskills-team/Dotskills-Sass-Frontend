"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { CustomerDueSummaryEntry, SupplierPayableSummaryEntry } from "@/types/ledger-summary";

export function buildCustomerDueSummaryColumns(labels: {
  name: string;
  phone: string;
  dueBalance: string;
}): ColumnDef<AppTableFeatures, CustomerDueSummaryEntry, unknown>[] {
  return [
    { accessorKey: "name", header: labels.name },
    {
      accessorKey: "phone",
      header: labels.phone,
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      accessorKey: "dueBalance",
      header: labels.dueBalance,
      cell: ({ row }) => <span className="font-medium tabular-nums">{Number(row.original.dueBalance).toLocaleString()}</span>,
    },
  ];
}

export function buildSupplierPayableSummaryColumns(labels: {
  name: string;
  phone: string;
  payableBalance: string;
}): ColumnDef<AppTableFeatures, SupplierPayableSummaryEntry, unknown>[] {
  return [
    { accessorKey: "name", header: labels.name },
    {
      accessorKey: "phone",
      header: labels.phone,
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      accessorKey: "payableBalance",
      header: labels.payableBalance,
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">{Number(row.original.payableBalance).toLocaleString()}</span>
      ),
    },
  ];
}
