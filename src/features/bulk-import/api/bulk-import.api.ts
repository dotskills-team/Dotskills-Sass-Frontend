import { baseApi } from "@/store/api/base-api";
import type { BulkImportProductRow, BulkImportSummary } from "@/types/bulk-import";

/** `companies/:companyId/products/bulk-import/{preview,confirm}` (verified product.controller.ts). Preview never writes; confirm re-validates identically and commits. */
export const bulkImportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    previewProductBulkImport: builder.mutation<BulkImportSummary, { companyId: string; rows: BulkImportProductRow[] }>({
      query: ({ companyId, rows }) => ({
        url: `/companies/${companyId}/products/bulk-import/preview`,
        method: "POST",
        body: { rows },
      }),
    }),

    confirmProductBulkImport: builder.mutation<BulkImportSummary, { companyId: string; rows: BulkImportProductRow[] }>({
      query: ({ companyId, rows }) => ({
        url: `/companies/${companyId}/products/bulk-import/confirm`,
        method: "POST",
        body: { rows },
      }),
      invalidatesTags: ["Product", "Category"],
    }),
  }),
});

export const { usePreviewProductBulkImportMutation, useConfirmProductBulkImportMutation } = bulkImportApi;
