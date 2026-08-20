"use client";

import { flexRender, useTable, type ColumnDef, type RowData } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { appTableFeatures, type AppTableFeatures } from "@/components/data-table/table-features";

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<AppTableFeatures, TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  /**
   * দিলে "#" column page-aware serial number দেখায় (page 2, limit 10 →
   * 11, 12, ...) — backend-এর নিজস্ব `meta.page`/`meta.limit` থেকে সরাসরি,
   * কোনো নতুন state বা API call ছাড়াই। না দিলে 1 থেকে শুরু হয়। এটা শুধু
   * display-level গণনা — data/query/pagination logic অপরিবর্তিত।
   */
  pagination?: { page: number; limit: number };
}

/**
 * একটাই reusable table primitive — Companies/Industries/Plans/
 * Subscriptions/Billing/Invoices/Payments সবগুলো page এই একই component
 * ব্যবহার করে, শুধু নিজের `columns` definition দিয়ে। Loading/empty/error
 * state এখানেই centralized।
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading,
  error,
  onRetry,
  pagination,
}: DataTableProps<TData>) {
  const t = useTranslations("common");
  const table = useTable({ features: appTableFeatures, columns, data });
  const indexOffset = pagination ? (pagination.page - 1) * pagination.limit : 0;

  if (isLoading) {
    return <DataTableSkeleton columnCount={columns.length + 1} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (data.length === 0) {
    return <EmptyState title={t("noDataFound")} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              <TableHead className="w-12">#</TableHead>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <TableRow key={row.id}>
              <TableCell className="text-muted-foreground tabular-nums">{indexOffset + rowIndex + 1}</TableCell>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
