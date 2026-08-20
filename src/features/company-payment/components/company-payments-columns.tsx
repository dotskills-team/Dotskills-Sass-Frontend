"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { CompanyPayment } from "@/types/company-payment";

export const companyPaymentsColumns: ColumnDef<AppTableFeatures, CompanyPayment, unknown>[] = [
  {
    accessorKey: "invoice",
    header: "Invoice #",
    cell: ({ row }) => (
      <Link href={`/company/payments/${row.original.id}`} className="font-mono text-xs hover:underline">
        {row.original.invoice.invoiceNumber}
      </Link>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount, row.original.currencyCode),
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => row.original.provider,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];
