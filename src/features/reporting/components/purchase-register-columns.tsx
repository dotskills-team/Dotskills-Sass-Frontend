"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { PurchaseRegisterEntry } from "@/types/purchase-register";
import type { Location } from "@/types/location";
import type { Supplier } from "@/types/supplier";

export function buildPurchaseRegisterColumns(
  locations: Location[],
  suppliers: Supplier[],
  labels: {
    orderNumber: string;
    date: string;
    location: string;
    supplier: string;
    status: string;
    total: string;
    receipts: string;
    returns: string;
  },
): ColumnDef<AppTableFeatures, PurchaseRegisterEntry, unknown>[] {
  return [
    { accessorKey: "orderNumber", header: labels.orderNumber },
    {
      accessorKey: "orderDate",
      header: labels.date,
      cell: ({ row }) => formatDate(row.original.orderDate),
    },
    {
      accessorKey: "locationId",
      header: labels.location,
      cell: ({ row }) => locations.find((l) => l.id === row.original.locationId)?.name ?? "—",
    },
    {
      accessorKey: "supplierId",
      header: labels.supplier,
      cell: ({ row }) => suppliers.find((s) => s.id === row.original.supplierId)?.name ?? "—",
    },
    {
      accessorKey: "status",
      header: labels.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "totalAmount",
      header: labels.total,
      cell: ({ row }) => <span className="font-medium tabular-nums">{Number(row.original.totalAmount).toLocaleString()}</span>,
    },
    {
      id: "receipts",
      header: labels.receipts,
      cell: ({ row }) => <span className="tabular-nums">{row.original._count.receipts}</span>,
    },
    {
      id: "returns",
      header: labels.returns,
      cell: ({ row }) => <span className="tabular-nums">{row.original._count.returns}</span>,
    },
  ];
}
