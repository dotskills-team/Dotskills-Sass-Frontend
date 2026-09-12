"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { getCompanyDisplayName, getCompanyOwner } from "@/lib/company-summary";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { PlatformSubscription } from "@/types/platform";
import { SubscriptionRowActions } from "@/features/subscription/components/subscription-actions";

export const subscriptionsColumns: ColumnDef<AppTableFeatures, PlatformSubscription, unknown>[] = [
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => {
      const { company, companyId } = row.original;
      if (!company || !companyId) return <span className="text-muted-foreground">—</span>;
      return (
        <Link
          href={`/platform/companies/${companyId}`}
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {getCompanyDisplayName(company)}
        </Link>
      );
    },
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const owner = row.original.company ? getCompanyOwner(row.original.company) : null;
      return <span className="font-medium text-foreground">{owner?.name ?? "—"}</span>;
    },
  },
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "billingPeriod",
    header: "Billing Period",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {formatDate(row.original.currentPeriodStart)} – {formatDate(row.original.currentPeriodEnd)}
      </span>
    ),
  },
  {
    accessorKey: "priceSnapshot",
    header: "Amount",
    cell: ({ row }) => {
      const snapshot = row.original.priceSnapshot;
      if (!snapshot?.amount || !snapshot.currencyCode) return "—";
      return formatCurrency(snapshot.amount, snapshot.currencyCode);
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <SubscriptionRowActions subscription={row.original} />,
  },
];
