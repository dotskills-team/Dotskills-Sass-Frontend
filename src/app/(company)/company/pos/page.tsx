"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListCustomersQuery } from "@/features/customer/api/customer.api";
import { useGetCompanySettingsQuery } from "@/features/company-settings/api/company-settings.api";
import { useCart } from "@/features/pos/hooks/use-cart";
import { useTender } from "@/features/pos/hooks/use-tender";
import { ProductSearchInput } from "@/features/pos/components/product-search-input";
import { PosCart } from "@/features/pos/components/pos-cart";
import { TenderSection } from "@/features/pos/components/tender-section";
import { useCreateSaleMutation } from "@/features/sale/api/sale.api";
import { useMyOpenSession } from "@/features/cash-drawer/hooks/use-my-open-session";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

const NO_CUSTOMER = "__none__";

export default function PosPage() {
  const t = useTranslations("pos");
  const tCommon = useTranslations("common");
  const tCashDrawer = useTranslations("cashDrawer");
  const locale = useLocale();
  const router = useRouter();
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { session: openCashDrawerSession } = useMyOpenSession(companyId);

  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const salesLocations = (locations ?? []).filter((location) => location.isSalesEnabled);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const locationId = selectedLocationId ?? salesLocations[0]?.id ?? "";

  const { data: customers } = useListCustomersQuery(companyId ?? "", { skip: !companyId });
  const { data: settings } = useGetCompanySettingsQuery(companyId ?? "", { skip: !companyId });

  const [customerId, setCustomerId] = useState(NO_CUSTOMER);
  const customer = customers?.find((c) => c.id === customerId);

  const [saleDiscountInput, setSaleDiscountInput] = useState("");
  const saleDiscountAmount = Number(saleDiscountInput) || 0;

  const { lines, addProduct, updateQuantity, updateDiscount, removeLine, clear: clearCart } = useCart();
  const tender = useTender();

  const [pendingDueConfirm, setPendingDueConfirm] = useState(false);
  const [createSale, { isLoading }] = useCreateSaleMutation();

  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const itemDiscountTotal = lines.reduce((sum, line) => sum + line.discountAmount, 0);
  const afterItemDiscounts = subtotal - itemDiscountTotal;
  const afterSaleDiscount = afterItemDiscounts - saleDiscountAmount;
  const taxAmount = settings?.enableTax ? afterSaleDiscount * (Number(settings.defaultTaxRate) / 100) : 0;
  const totalAmount = Math.round(afterSaleDiscount + taxAmount);

  const entered = tender.lines.reduce((sum, line) => sum + line.amount, 0);
  const dueAmount = tender.lines.filter((line) => line.method === "DUE").reduce((sum, line) => sum + line.amount, 0);

  const exceedsDueLimit =
    !!customer &&
    dueAmount > 0 &&
    settings?.maxCustomerDueLimit != null &&
    Number(customer.dueBalance) + dueAmount > Number(settings.maxCustomerDueLimit);

  async function submitSale() {
    const result = await createSale({
      companyId: companyId!,
      body: {
        locationId,
        customerId: customerId === NO_CUSTOMER ? undefined : customerId,
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, discountAmount: line.discountAmount || undefined })),
        saleDiscountAmount: saleDiscountAmount || undefined,
        payments: tender.lines.filter((line) => line.amount > 0).map((line) => ({ method: line.method, amount: line.amount })),
      },
    });

    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }

    if (result.data.warnings.includes("DUE_LIMIT_EXCEEDED")) {
      toast.warning(t("dueLimitDialog.description"));
    }
    toast.success(t("submit.success"));
    clearCart();
    tender.reset();
    router.push(`/company/sales/${result.data.sale.id}/receipt`);
  }

  function handleCompleteSale() {
    if (lines.length === 0 || !locationId) return;

    if (Math.abs(totalAmount - entered) >= 0.01) {
      toast.error(t("submit.paymentMismatch"));
      return;
    }
    if (dueAmount > 0 && customerId === NO_CUSTOMER) {
      toast.error(t("submit.customerRequiredForDue"));
      return;
    }
    if (exceedsDueLimit) {
      setPendingDueConfirm(true);
      return;
    }
    void submitSale();
  }

  const canSubmit = lines.length > 0 && !!locationId && Math.abs(totalAmount - entered) < 0.01;

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SALE_CREATE} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {!openCashDrawerSession && (
            <Alert>
              <AlertTitle>{tCashDrawer("posNudge.title")}</AlertTitle>
              <AlertDescription>
                {tCashDrawer("posNudge.description")}{" "}
                <Link href="/company/cash-drawer" className="font-medium underline">
                  {tCashDrawer("posNudge.link")}
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <div className="max-w-xs">
            <label className="mb-1 block text-sm font-medium">{t("location")}</label>
            <Select value={locationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("locationPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {salesLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {salesLocations.length === 0 && (
              <p className="mt-1 text-sm text-destructive">{t("noSalesLocations")}</p>
            )}
          </div>

          <ProductSearchInput companyId={companyId ?? ""} onSelectProduct={addProduct} />

          <PosCart lines={lines} onUpdateQuantity={updateQuantity} onUpdateDiscount={updateDiscount} onRemove={removeLine} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("summary.total")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("summary.subtotal")}</span>
                <span className="tabular-nums">{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("summary.itemDiscount")}</span>
                <span className="tabular-nums">{itemDiscountTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t("summary.saleDiscount")}</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={saleDiscountInput}
                  onChange={(event) => setSaleDiscountInput(event.target.value)}
                  placeholder={t("saleDiscountPlaceholder")}
                  className="w-28 text-right"
                />
              </div>
              {settings?.enableTax && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("summary.tax")}</span>
                  <span className="tabular-nums">{taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>{t("summary.total")}</span>
                <span className="tabular-nums">{totalAmount.toLocaleString()}</span>
              </div>

              <div className="pt-2">
                <label className="mb-1 block text-sm font-medium">{t("customer.label")}</label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("customer.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CUSTOMER}>{t("customer.none")}</SelectItem>
                    {(customers ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {customer && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("customer.dueBalance", { balance: Number(customer.dueBalance).toLocaleString() })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <TenderSection
                lines={tender.lines}
                total={totalAmount}
                entered={entered}
                onAddLine={tender.addLine}
                onUpdateMethod={tender.updateMethod}
                onUpdateAmount={tender.updateAmount}
                onRemoveLine={tender.removeLine}
              />
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" disabled={!canSubmit || isLoading} onClick={handleCompleteSale}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("submit.button")}
          </Button>
        </div>
      </div>

      <ActionConfirmDialog
        open={pendingDueConfirm}
        onOpenChange={setPendingDueConfirm}
        title={t("dueLimitDialog.title")}
        description={t("dueLimitDialog.description")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isLoading}
        onConfirm={() => {
          setPendingDueConfirm(false);
          void submitSale();
        }}
      />
    </CompanyPermissionGate>
  );
}
