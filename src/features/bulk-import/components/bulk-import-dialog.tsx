"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Papa from "papaparse";
import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";

import { downloadProductBulkImportTemplate } from "@/features/bulk-import/lib/csv-template";
import {
  usePreviewProductBulkImportMutation,
  useConfirmProductBulkImportMutation,
} from "@/features/bulk-import/api/bulk-import.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { BulkImportProductRow, BulkImportSummary } from "@/types/bulk-import";

type Step = "upload" | "preview" | "done";
const PAGE_SIZE = 20;

function statusVariant(status: string): "default" | "secondary" | "destructive" {
  if (status === "ERROR") return "destructive";
  if (status === "UPDATE") return "secondary";
  return "default";
}

export function BulkImportDialog({ companyId }: { companyId: string }) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<BulkImportProductRow[]>([]);
  const [preview, setPreview] = useState<BulkImportSummary | null>(null);
  const [confirmed, setConfirmed] = useState<BulkImportSummary | null>(null);
  const [page, setPage] = useState(1);

  const [previewImport, { isLoading: isPreviewing }] = usePreviewProductBulkImportMutation();
  const [confirmImport, { isLoading: isConfirming }] = useConfirmProductBulkImportMutation();

  function reset() {
    setStep("upload");
    setRows([]);
    setPreview(null);
    setConfirmed(null);
    setPage(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<BulkImportProductRow>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: async (result) => {
        if (result.errors.length > 0 && result.data.length === 0) {
          toast.error(t("bulkImport.parseError"));
          return;
        }
        if (result.data.length === 0) {
          toast.error(t("bulkImport.emptyFileError"));
          return;
        }

        setRows(result.data);
        const response = await previewImport({ companyId, rows: result.data });
        if ("error" in response) {
          toast.error(normalizeApiError(response.error).message);
          return;
        }
        setPreview(response.data);
        setPage(1);
        setStep("preview");
      },
      error: () => {
        toast.error(t("bulkImport.parseError"));
      },
    });
  }

  async function handleConfirm() {
    const response = await confirmImport({ companyId, rows });
    if ("error" in response) {
      toast.error(normalizeApiError(response.error).message);
      return;
    }
    setConfirmed(response.data);
    setStep("done");
    toast.success(t("bulkImport.confirmSuccess", { createdCount: response.data.createdCount, updatedCount: response.data.updatedCount }));
  }

  const totalPages = preview ? Math.ceil(preview.results.length / PAGE_SIZE) : 0;
  const pageResults = preview ? preview.results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PRODUCT_BULK_IMPORT}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload aria-hidden="true" />
            {t("bulkImport.trigger")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("bulkImport.title")}</DialogTitle>
          <DialogDescription>{t("bulkImport.description")}</DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <Button type="button" variant="outline" onClick={downloadProductBulkImportTemplate}>
              <Download aria-hidden="true" />
              {t("bulkImport.downloadTemplate")}
            </Button>

            <div className="space-y-2">
              <label htmlFor="bulk-import-file" className="text-sm font-medium">
                {t("bulkImport.uploadLabel")}
              </label>
              <input
                id="bulk-import-file"
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelected}
                disabled={isPreviewing}
                className="block w-full rounded-md border border-input px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
              <p className="text-sm text-muted-foreground">{t("bulkImport.uploadHelp")}</p>
            </div>

            {isPreviewing && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("bulkImport.previewing")}
              </p>
            )}
          </div>
        )}

        {step === "preview" && preview && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-sm font-medium">
                {t("bulkImport.previewSummary", {
                  createCount: preview.createdCount,
                  updateCount: preview.updatedCount,
                  errorCount: preview.errorCount,
                })}
              </p>
              {preview.errorCount > 0 && <p className="text-sm text-muted-foreground">{t("bulkImport.previewErrorNotice")}</p>}
            </div>

            <div className="max-h-96 overflow-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{t("bulkImport.columns.row")}</TableHead>
                    <TableHead>{t("bulkImport.columns.sku")}</TableHead>
                    <TableHead>{t("bulkImport.columns.status")}</TableHead>
                    <TableHead>{t("bulkImport.columns.detail")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageResults.map((result) => (
                    <TableRow key={result.rowIndex}>
                      <TableCell className="tabular-nums text-muted-foreground">{result.rowIndex + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{result.sku || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(result.status)}>{t(`bulkImport.status.${result.status}`)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.errorMessage
                          ? result.errorMessage
                          : result.categoryWillBeCreated
                            ? t("bulkImport.categoryWillBeCreated", { name: rows[result.rowIndex]?.categoryName ?? "" })
                            : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <DataTablePagination page={page} totalPages={totalPages} total={preview.results.length} onPageChange={setPage} />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={reset} disabled={isConfirming}>
                {t("bulkImport.startOver")}
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming || preview.createdCount + preview.updatedCount === 0}
              >
                {isConfirming && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {t("bulkImport.confirm", { count: preview.createdCount + preview.updatedCount })}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "done" && confirmed && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium">{t("bulkImport.confirmSuccess", { createdCount: confirmed.createdCount, updatedCount: confirmed.updatedCount })}</p>
              {confirmed.errorCount > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("bulkImport.confirmPartialErrorNotice", { errorCount: confirmed.errorCount })}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                {t("bulkImport.done")}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "upload" && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {tCommon("cancel")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
