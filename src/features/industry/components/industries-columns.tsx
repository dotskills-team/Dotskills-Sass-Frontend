"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { Industry } from "@/types/platform";
import { IndustryRowActions } from "@/features/industry/components/industry-actions";

export const industriesColumns: ColumnDef<AppTableFeatures, Industry, unknown>[] = [
  {
    accessorKey: "name",
    header: "Industry",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.code}</p>
      </div>
    ),
  },
  {
    accessorKey: "_count",
    header: "Companies",
    cell: ({ row }) => row.original._count.companies,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <IndustryRowActions industry={row.original} />,
  },
];
