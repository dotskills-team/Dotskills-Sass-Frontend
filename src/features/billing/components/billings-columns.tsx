"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { PlatformBilling } from "@/types/platform";
import { BillingRowActions } from "@/features/billing/components/billing-actions";

export const billingsColumns: ColumnDef<AppTableFeatures, PlatformBilling, unknown>[] = [
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <Link href={`/platform/billing/${row.original.id}`} className="font-medium hover:underline">
        {formatCurrency(row.original.amount, row.original.currencyCode)}
      </Link>
    ),
  },
  {
    accessorKey: "periodStart",
    header: "Period",
    cell: ({ row }) => `${formatDate(row.original.periodStart)} – ${formatDate(row.original.periodEnd)}`,
  },
  {
    accessorKey: "dueAt",
    header: "Due",
    cell: ({ row }) => formatDate(row.original.dueAt),
  },
  {
    accessorKey: "attemptCount",
    header: "Attempts",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <BillingRowActions billing={row.original} />,
  },
];
