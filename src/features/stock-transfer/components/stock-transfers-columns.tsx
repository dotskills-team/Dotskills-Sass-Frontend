"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { StockTransfer } from "@/types/stock-transfer";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";
import { StockTransferRowActions } from "@/features/stock-transfer/components/stock-transfer-row-actions";

export function buildStockTransfersColumns(
  companyId: string,
  locations: Location[],
  products: Product[],
  labels: {
    product: string;
    fromLocation: string;
    toLocation: string;
    quantity: string;
    status: string;
    createdAt: string;
    actions: string;
  },
): ColumnDef<AppTableFeatures, StockTransfer, unknown>[] {
  return [
    {
      accessorKey: "productId",
      header: labels.product,
      cell: ({ row }) => products.find((p) => p.id === row.original.productId)?.name ?? "—",
    },
    {
      accessorKey: "fromLocationId",
      header: labels.fromLocation,
      cell: ({ row }) => locations.find((l) => l.id === row.original.fromLocationId)?.name ?? "—",
    },
    {
      accessorKey: "toLocationId",
      header: labels.toLocation,
      cell: ({ row }) => locations.find((l) => l.id === row.original.toLocationId)?.name ?? "—",
    },
    {
      accessorKey: "quantity",
      header: labels.quantity,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.quantity).toLocaleString()}</span>,
    },
    {
      accessorKey: "status",
      header: labels.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: labels.createdAt,
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: labels.actions,
      cell: ({ row }) => <StockTransferRowActions companyId={companyId} transfer={row.original} />,
    },
  ];
}
