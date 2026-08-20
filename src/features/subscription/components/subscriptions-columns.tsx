"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { PlatformSubscription } from "@/types/platform";
import { SubscriptionRowActions } from "@/features/subscription/components/subscription-actions";

export const subscriptionsColumns: ColumnDef<AppTableFeatures, PlatformSubscription, unknown>[] = [
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <Link href={`/platform/subscriptions/${row.original.id}`} className="hover:underline">
        {row.original.plan?.name ?? "—"}
      </Link>
    ),
  },
  {
    accessorKey: "billingCycle",
    header: "Cycle",
  },
  {
    accessorKey: "priceSnapshot",
    header: "Price",
    cell: ({ row }) => {
      const snapshot = row.original.priceSnapshot;
      if (!snapshot?.amount || !snapshot.currencyCode) return "—";
      return formatCurrency(snapshot.amount, snapshot.currencyCode);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "currentPeriodEnd",
    header: "Current period ends",
    cell: ({ row }) => formatDate(row.original.currentPeriodEnd),
  },
  {
    accessorKey: "autoRenew",
    header: "Auto-renew",
    cell: ({ row }) => (row.original.autoRenew ? "Yes" : "No"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <SubscriptionRowActions subscription={row.original} />,
  },
];
