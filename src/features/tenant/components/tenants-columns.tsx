"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { Tenant } from "@/types/platform";
import { TenantRowActions } from "@/features/tenant/components/tenant-actions";

export const tenantsColumns: ColumnDef<AppTableFeatures, Tenant, unknown>[] = [
  {
    accessorKey: "name",
    header: "Tenant",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.code} · {row.original.slug}</p>
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
    cell: ({ row }) => <TenantRowActions tenant={row.original} />,
  },
];
