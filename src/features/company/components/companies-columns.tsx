"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters/date";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { Company } from "@/types/platform";
import { CompanyRowActions } from "@/features/company/components/company-actions";

export const companiesColumns: ColumnDef<AppTableFeatures, Company, unknown>[] = [
  {
    accessorKey: "legalName",
    header: "Company",
    cell: ({ row }) => (
      <Link href={`/platform/companies/${row.original.id}`} className="block hover:underline">
        <p className="font-medium text-foreground">
          {row.original.tradeName || row.original.legalName}
        </p>
        <p className="text-xs text-muted-foreground">{row.original.code}</p>
      </Link>
    ),
  },
  {
    accessorKey: "industry",
    header: "Industry",
    cell: ({ row }) => row.original.industry?.name ?? "—",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "—",
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
    cell: ({ row }) => <CompanyRowActions company={row.original} />,
  },
];
