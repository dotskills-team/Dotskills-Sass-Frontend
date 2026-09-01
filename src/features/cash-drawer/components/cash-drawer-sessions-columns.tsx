"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatters/date";
import { getSessionStatusToneClass } from "@/features/cash-drawer/lib/session-status-tone";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { CashDrawerSession } from "@/types/cash-drawer-session";
import type { Location } from "@/types/location";
import type { CompanyMember } from "@/types/company-rbac";

export function buildCashDrawerSessionsColumns(
  locations: Location[],
  members: CompanyMember[],
  labels: {
    location: string;
    cashier: string;
    openedAt: string;
    closedAt: string;
    opening: string;
    expected: string;
    actual: string;
    variance: string;
    status: string;
  },
): ColumnDef<AppTableFeatures, CashDrawerSession, unknown>[] {
  return [
    {
      accessorKey: "locationId",
      header: labels.location,
      cell: ({ row }) => locations.find((location) => location.id === row.original.locationId)?.name ?? "—",
    },
    {
      accessorKey: "cashierId",
      header: labels.cashier,
      cell: ({ row }) => members.find((member) => member.user.id === row.original.cashierId)?.user.fullName ?? "—",
    },
    {
      accessorKey: "shiftStart",
      header: labels.openedAt,
      cell: ({ row }) => formatDateTime(row.original.shiftStart),
    },
    {
      accessorKey: "shiftEnd",
      header: labels.closedAt,
      cell: ({ row }) => (row.original.shiftEnd ? formatDateTime(row.original.shiftEnd) : "—"),
    },
    {
      accessorKey: "openingBalance",
      header: labels.opening,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.openingBalance).toLocaleString()}</span>,
    },
    {
      accessorKey: "expectedClosingBalance",
      header: labels.expected,
      cell: ({ row }) =>
        row.original.expectedClosingBalance != null ? (
          <span className="tabular-nums">{Number(row.original.expectedClosingBalance).toLocaleString()}</span>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "actualClosingBalance",
      header: labels.actual,
      cell: ({ row }) =>
        row.original.actualClosingBalance != null ? (
          <span className="tabular-nums">{Number(row.original.actualClosingBalance).toLocaleString()}</span>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "variance",
      header: labels.variance,
      cell: ({ row }) => {
        if (row.original.variance == null) return "—";
        const variance = Number(row.original.variance);
        const formatted = Math.abs(variance).toLocaleString();
        return <span className="tabular-nums">{variance > 0 ? `+${formatted}` : variance < 0 ? `-${formatted}` : formatted}</span>;
      },
    },
    {
      accessorKey: "status",
      header: labels.status,
      // Deliberately NOT the shared StatusBadge — its STATUS_TONE maps
      // CLOSED -> destructive for Company.status's very different meaning.
      cell: ({ row }) => (
        <Badge variant="outline" className={getSessionStatusToneClass(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
  ];
}
