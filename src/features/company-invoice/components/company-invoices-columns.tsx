"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { CompanyInvoice } from "@/types/company-invoice";

export const companyInvoicesColumns: ColumnDef<AppTableFeatures, CompanyInvoice, unknown>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ row }) => (
      <Link href={`/company/invoices/${row.original.id}`} className="font-mono text-xs hover:underline">
        {row.original.invoiceNumber}
      </Link>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.totalAmount, row.original.currencyCode),
  },
  {
    accessorKey: "dueAt",
    header: "Due",
    cell: ({ row }) => formatDate(row.original.dueAt),
  },
  {
    accessorKey: "paidAt",
    header: "Paid",
    cell: ({ row }) => (row.original.paidAt ? formatDate(row.original.paidAt) : "—"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];
