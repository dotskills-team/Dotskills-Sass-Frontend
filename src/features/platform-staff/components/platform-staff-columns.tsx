"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { PlatformStaffMember } from "@/types/platform-staff";
import { PlatformStaffRowActions } from "@/features/platform-staff/components/platform-staff-actions";

export const platformStaffColumns: ColumnDef<AppTableFeatures, PlatformStaffMember, unknown>[] = [
  {
    accessorKey: "user",
    header: "Staff",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.user.fullName}</p>
        <p className="text-xs text-muted-foreground">{row.original.user.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) =>
      row.original.roles.length > 0 ? row.original.roles.map((r) => r.platformRole.name).join(", ") : "—",
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
    cell: ({ row }) => <PlatformStaffRowActions staff={row.original} />,
  },
];
