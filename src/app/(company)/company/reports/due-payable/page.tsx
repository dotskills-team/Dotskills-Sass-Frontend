"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import {
  useGetCustomerDueSummaryQuery,
  useGetSupplierPayableSummaryQuery,
  useLazyExportCustomerDueSummaryQuery,
  useLazyExportSupplierPayableSummaryQuery,
} from "@/features/reporting/api/reporting.api";
import {
  buildCustomerDueSummaryColumns,
  buildSupplierPayableSummaryColumns,
} from "@/features/reporting/components/ledger-summary-columns";
import { downloadBlob } from "@/lib/download-blob";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

type LedgerTab = "customer" | "supplier";

export default function DuePayableLedgerPage() {
  const t = useTranslations("reports");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const [activeTab, setActiveTab] = useState<LedgerTab>("customer");
  const [customerPage, setCustomerPage] = useState(1);
  const [supplierPage, setSupplierPage] = useState(1);

  const customerDue = useGetCustomerDueSummaryQuery(
    { companyId: companyId ?? "", page: customerPage },
    { skip: !companyId || activeTab !== "customer" },
  );
  const supplierPayable = useGetSupplierPayableSummaryQuery(
    { companyId: companyId ?? "", page: supplierPage },
    { skip: !companyId || activeTab !== "supplier" },
  );

  const [triggerExportCustomer, { isFetching: isExportingCustomer }] = useLazyExportCustomerDueSummaryQuery();
  const [triggerExportSupplier, { isFetching: isExportingSupplier }] = useLazyExportSupplierPayableSummaryQuery();

  const customerColumns = buildCustomerDueSummaryColumns({
    name: t("duePayableLedger.customerColumns.name"),
    phone: t("duePayableLedger.customerColumns.phone"),
    dueBalance: t("duePayableLedger.customerColumns.dueBalance"),
  });
  const supplierColumns = buildSupplierPayableSummaryColumns({
    name: t("duePayableLedger.supplierColumns.name"),
    phone: t("duePayableLedger.supplierColumns.phone"),
    payableBalance: t("duePayableLedger.supplierColumns.payableBalance"),
  });

  async function handleExportCustomer() {
    if (!companyId) return;
    const result = await triggerExportCustomer({ companyId });
    if (result.error || !result.data) {
      toast.error(t("exportFailed"));
      return;
    }
    downloadBlob(result.data, "customer-due-summary.csv");
  }

  async function handleExportSupplier() {
    if (!companyId) return;
    const result = await triggerExportSupplier({ companyId });
    if (result.error || !result.data) {
      toast.error(t("exportFailed"));
      return;
    }
    downloadBlob(result.data, "supplier-payable-summary.csv");
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.REPORT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("duePayableLedger.title")} description={t("duePayableLedger.description")} />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LedgerTab)}>
          <TabsList>
            <TabsTrigger value="customer">{t("duePayableLedger.customerTab")}</TabsTrigger>
            <TabsTrigger value="supplier">{t("duePayableLedger.supplierTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-4 pt-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleExportCustomer} disabled={!companyId || isExportingCustomer}>
                {isExportingCustomer && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {isExportingCustomer ? t("exporting") : t("exportButton")}
              </Button>
            </div>

            <DataTable
              columns={customerColumns}
              data={customerDue.data?.items ?? []}
              isLoading={!companyId || customerDue.isLoading || customerDue.isFetching}
              error={customerDue.error}
              onRetry={customerDue.refetch}
              pagination={customerDue.data?.meta ?? undefined}
            />

            {customerDue.data?.meta && customerDue.data.meta.totalPages > 1 && (
              <DataTablePagination
                page={customerDue.data.meta.page}
                totalPages={customerDue.data.meta.totalPages}
                total={customerDue.data.meta.total}
                onPageChange={setCustomerPage}
              />
            )}
          </TabsContent>

          <TabsContent value="supplier" className="space-y-4 pt-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleExportSupplier} disabled={!companyId || isExportingSupplier}>
                {isExportingSupplier && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {isExportingSupplier ? t("exporting") : t("exportButton")}
              </Button>
            </div>

            <DataTable
              columns={supplierColumns}
              data={supplierPayable.data?.items ?? []}
              isLoading={!companyId || supplierPayable.isLoading || supplierPayable.isFetching}
              error={supplierPayable.error}
              onRetry={supplierPayable.refetch}
              pagination={supplierPayable.data?.meta ?? undefined}
            />

            {supplierPayable.data?.meta && supplierPayable.data.meta.totalPages > 1 && (
              <DataTablePagination
                page={supplierPayable.data.meta.page}
                totalPages={supplierPayable.data.meta.totalPages}
                total={supplierPayable.data.meta.total}
                onPageChange={setSupplierPage}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CompanyPermissionGate>
  );
}
