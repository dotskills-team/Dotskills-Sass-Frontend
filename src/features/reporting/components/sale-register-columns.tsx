"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { SaleRegisterEntry } from "@/types/sale-register";
import type { Location } from "@/types/location";
import type { Customer } from "@/types/customer";

export function buildSaleRegisterColumns(
  locations: Location[],
  customers: Customer[],
  labels: {
    saleNumber: string;
    date: string;
    location: string;
    customer: string;
    status: string;
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
  },
): ColumnDef<AppTableFeatures, SaleRegisterEntry, unknown>[] {
  return [
    { accessorKey: "saleNumber", header: labels.saleNumber },
    {
      accessorKey: "saleDate",
      header: labels.date,
      cell: ({ row }) => formatDate(row.original.saleDate),
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
      accessorKey: "status",
      header: labels.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "subtotal",
      header: labels.subtotal,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.subtotal).toLocaleString()}</span>,
    },
    {
      id: "discount",
      header: labels.discount,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {(Number(row.original.itemDiscountTotal) + Number(row.original.saleDiscountAmount)).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "taxAmount",
      header: labels.tax,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.taxAmount).toLocaleString()}</span>,
    },
    {
      accessorKey: "totalAmount",
      header: labels.total,
      cell: ({ row }) => <span className="font-medium tabular-nums">{Number(row.original.totalAmount).toLocaleString()}</span>,
    },
  ];
}
