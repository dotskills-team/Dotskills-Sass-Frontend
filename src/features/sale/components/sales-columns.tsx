"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { Sale } from "@/types/sale";
import type { Location } from "@/types/location";
import type { Customer } from "@/types/customer";

export function buildSalesColumns(
  locations: Location[],
  customers: Customer[],
  labels: { saleNumber: string; location: string; customer: string; total: string; status: string; date: string },
): ColumnDef<AppTableFeatures, Sale, unknown>[] {
  return [
    {
      accessorKey: "saleNumber",
      header: labels.saleNumber,
      cell: ({ row }) => (
        <Link href={`/company/sales/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.saleNumber}
        </Link>
      ),
    },
    {
      accessorKey: "locationId",
      header: labels.location,
      cell: ({ row }) => locations.find((l) => l.id === row.original.locationId)?.name ?? "—",
    },
    {
      accessorKey: "customerId",
      header: labels.customer,
      cell: ({ row }) => {
        if (!row.original.customerId) return "—";
        return customers.find((c) => c.id === row.original.customerId)?.name ?? "—";
      },
    },
    {
      accessorKey: "totalAmount",
      header: labels.total,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.totalAmount).toLocaleString()}</span>,
    },
    {
      accessorKey: "status",
      header: labels.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "saleDate",
      header: labels.date,
      cell: ({ row }) => formatDate(row.original.saleDate),
    },
  ];
}
