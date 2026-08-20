"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { Feature } from "@/types/platform";
import { FeatureRowActions } from "@/features/feature/components/feature-actions";

export const featuresColumns: ColumnDef<AppTableFeatures, Feature, unknown>[] = [
  {
    accessorKey: "name",
    header: "Feature",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.code}</p>
      </div>
    ),
  },
  {
    accessorKey: "module",
    header: "Module",
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
    cell: ({ row }) => <FeatureRowActions feature={row.original} />,
  },
];
