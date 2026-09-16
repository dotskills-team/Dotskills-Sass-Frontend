"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { Sale } from "@/types/sale";
import type { Location } from "@/types/location";
import { NeedsReviewActions } from "@/features/sale/components/needs-review-actions";

export function buildNeedsReviewColumns(
  companyId: string,
  locations: Location[],
  labels: { saleNumber: string; location: string; total: string; date: string; actions: string },
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
      accessorKey: "totalAmount",
      header: labels.total,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.totalAmount).toLocaleString()}</span>,
    },
    {
      accessorKey: "saleDate",
      header: labels.date,
      cell: ({ row }) => formatDate(row.original.saleDate),
    },
    {
      id: "actions",
      header: labels.actions,
      cell: ({ row }) => <NeedsReviewActions companyId={companyId} sale={row.original} />,
    },
  ];
}
