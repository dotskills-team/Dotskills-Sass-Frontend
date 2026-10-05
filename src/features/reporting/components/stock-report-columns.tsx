// "use client";

// import type { ColumnDef } from "@tanstack/react-table";

// import { Badge } from "@/components/ui/badge";
// import type { AppTableFeatures } from "@/components/data-table/table-features";
// import type { StockReportEntry } from "@/types/stock-report";

// export function buildStockReportColumns(labels: {
//   product: string;
//   sku: string;
//   location: string;
//   quantity: string;
//   lowStock: string;
//    sales?: {
//     soldQuantity: string;
//     soldAmount: string;
//     saleCount: string;
//     avgPrice: string;
//   }
// }): ColumnDef<AppTableFeatures, StockReportEntry, unknown>[] {
//   return [
//     {
//       accessorKey: "product",
//       header: labels.product,
//       cell: ({ row }) => (
//         <span className="flex items-center gap-2">
//           {row.original.displayName}
//           {row.original.belowReorderLevel && (
//             <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning">
//               {labels.lowStock}
//             </Badge>
//           )}
//         </span>
//       ),
//     },
//     {
//       id: "sku",
//       header: labels.sku,
//       cell: ({ row }) => row.original.product.sku,
//     },
//     {
//       id: "location",
//       header: labels.location,
//       cell: ({ row }) => row.original.location.name,
//     },
//     {
//       accessorKey: "quantity",
//       header: labels.quantity,
//       cell: ({ row }) => <span className="tabular-nums">{Number(row.original.quantity).toLocaleString()}</span>,
//     },
//   ];
// }

"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { AppTableFeatures } from "@/components/data-table/table-features";
import type { StockReportEntry } from "@/types/stock-report";

export function buildStockReportColumns(labels: {
  product: string;
  sku: string;
  location: string;
  quantity: string;
  lowStock: string;
  sales?: {
    soldQuantity: string;
    soldAmount: string;
    saleCount: string;
    avgPrice: string;
  };
}): ColumnDef<AppTableFeatures, StockReportEntry, unknown>[] {
  const columns: ColumnDef<AppTableFeatures, StockReportEntry, unknown>[] = [
    
    {
      accessorKey: "product",
      header: labels.product,
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          {row.original.displayName}
          {row.original.belowReorderLevel && (
            <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning">
              {labels.lowStock}
            </Badge>
          )}
        </span>
      ),
    },
    {
      id: "sku",
      header: labels.sku,
      cell: ({ row }) => row.original.product.sku,
    },
    {
      id: "location",
      header: labels.location,
      cell: ({ row }) => row.original.location.name,
    },
    {
      accessorKey: "quantity",
      header: labels.quantity,
      cell: ({ row }) => <span className="tabular-nums">{Number(row.original.quantity).toLocaleString()}</span>,
    },
  ];

  if (labels.sales) {
    const s = labels.sales;
    columns.push(
      {
        id: "soldQuantity",
        header: s.soldQuantity,
        cell: ({ row }) => (
          <span className="tabular-nums">{Number(row.original.sales?.soldQuantity ?? 0).toLocaleString()}</span>
        ),
      },
      {
        id: "soldAmount",
        header: s.soldAmount,
        cell: ({ row }) => (
          <span className="tabular-nums">{Number(row.original.sales?.soldAmount ?? 0).toLocaleString()}</span>
        ),
      },
      {
        id: "saleCount",
        header: s.saleCount,
        cell: ({ row }) => <span className="tabular-nums">{row.original.sales?.saleCount ?? 0}</span>,
      },
      {
        id: "avgPrice",
        header: s.avgPrice,
        cell: ({ row }) => {
          const v = row.original.sales?.avgSellingPrice;
          return <span className="tabular-nums">{v ? Number(v).toLocaleString() : "—"}</span>;
        },
      },
    );
  }

  return columns;
}