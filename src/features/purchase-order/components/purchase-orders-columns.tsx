"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { PurchaseOrder } from "@/types/purchase-order";
import type { Supplier } from "@/types/supplier";
import type { Location } from "@/types/location";

export function buildPurchaseOrdersColumns(
  suppliers: Supplier[],
  locations: Location[],
  labels: { orderNumber: string; supplier: string; location: string; orderDate: string; totalAmount: string; status: string },
): ColumnDef<AppTableFeatures, PurchaseOrder, unknown>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: labels.orderNumber,
      cell: ({ row }) => (
        <Link href={`/company/purchase-orders/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      accessorKey: "supplierId",
      header: labels.supplier,
      cell: ({ row }) => suppliers.find((s) => s.id === row.original.supplierId)?.name ?? "—",
    },
    {
      accessorKey: "locationId",
      header: labels.location,
      cell: ({ row }) => locations.find((l) => l.id === row.original.locationId)?.name ?? "—",
    },
    {
      accessorKey: "orderDate",
      header: labels.orderDate,
      cell: ({ row }) => formatDate(row.original.orderDate),
    },
    {
      accessorKey: "totalAmount",
      header: labels.totalAmount,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.totalAmount).toLocaleString()}</span>,
    },
    {
      accessorKey: "status",
      header: labels.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];
}
