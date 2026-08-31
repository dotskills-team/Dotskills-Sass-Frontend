"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/shared/status-badge";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { Unit } from "@/types/unit";
import { ProductRowActions } from "@/features/product/components/product-actions";

/**
 * A factory (not a static array) because each row's actions/lookups need
 * `companyId` + the full `categories`/`units` lists to resolve names and
 * populate the edit form's selects — mirrors `industries-columns.tsx`'s
 * shape otherwise.
 */
export function buildProductsColumns(
  companyId: string,
  categories: Category[],
  units: Unit[],
  labels: { product: string; category: string; unit: string; salePrice: string; reorderLevel: string; status: string },
): ColumnDef<AppTableFeatures, Product, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: labels.product,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.sku}</p>
        </div>
      ),
    },
    {
      accessorKey: "categoryId",
      header: labels.category,
      cell: ({ row }) => categories.find((category) => category.id === row.original.categoryId)?.name ?? "—",
    },
    {
      accessorKey: "baseUnitId",
      header: labels.unit,
      cell: ({ row }) => units.find((unit) => unit.id === row.original.baseUnitId)?.code ?? "—",
    },
    {
      accessorKey: "salePrice",
      header: labels.salePrice,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.salePrice).toLocaleString()}</span>,
    },
    {
      accessorKey: "reorderLevel",
      header: labels.reorderLevel,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.reorderLevel).toLocaleString()}</span>,
    },
    {
      accessorKey: "status",
      header: labels.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ProductRowActions companyId={companyId} product={row.original} categories={categories} units={units} />
      ),
    },
  ];
}
