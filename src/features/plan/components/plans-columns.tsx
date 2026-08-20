"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { Plan } from "@/types/platform";
import { PlanRowActions } from "@/features/plan/components/plan-actions";

export const plansColumns: ColumnDef<AppTableFeatures, Plan, unknown>[] = [
  {
    accessorKey: "name",
    header: "Plan",
    cell: ({ row }) => (
      <Link href={`/platform/plans/${row.original.id}`} className="block hover:underline">
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.code}</p>
      </Link>
    ),
  },
  {
    accessorKey: "isPublic",
    header: "Visibility",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.isPublic ? "Public" : "Private"}</Badge>
    ),
  },
  {
    accessorKey: "trialDays",
    header: "Trial",
    cell: ({ row }) => (row.original.trialDays > 0 ? `${row.original.trialDays} days` : "—"),
  },
  {
    accessorKey: "_count",
    header: "Subscriptions",
    cell: ({ row }) => row.original._count.subscriptions,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <PlanRowActions plan={row.original} />,
  },
];
