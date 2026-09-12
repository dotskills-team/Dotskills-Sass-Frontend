"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";
import { getCompanyDisplayName } from "@/lib/company-summary";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { PlatformPayment } from "@/types/platform";
import { PaymentRowActions } from "@/features/payment/components/payment-actions";

export const paymentsColumns: ColumnDef<AppTableFeatures, PlatformPayment, unknown>[] = [
  {
    accessorKey: "providerTransactionId",
    header: "Transaction",
    cell: ({ row }) => (
      <Link href={`/platform/payments/${row.original.id}`} className="block hover:underline">
        <p className="font-mono text-xs">{row.original.providerTransactionId}</p>
        <p className="text-xs text-muted-foreground">{row.original.provider}</p>
      </Link>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => getCompanyDisplayName(row.original.company),
  },
  {
    id: "invoice",
    header: "Invoice #",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoice.invoiceNumber}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount, row.original.currencyCode),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "failureReason",
    header: "Failure reason",
    cell: ({ row }) => row.original.failureReason ?? "—",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <PaymentRowActions payment={row.original} />,
  },
];
