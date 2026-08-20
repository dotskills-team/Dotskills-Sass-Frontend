"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/formatters/currency";
import { useListBillingsQuery } from "@/features/billing/api/billing.api";
import { useCreateInvoiceMutation } from "@/features/invoice/api/invoice.api";

/** `CreateInvoiceDto`-তে শুধু `{billingId}` — invoice number/amount/subtotal সব backend derive করে (verified)। */
export function CreateInvoiceDialog() {
  const t = useTranslations("invoices");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [billingId, setBillingId] = useState("");

  const { data: billings } = useListBillingsQuery({ limit: 100 });
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();

  async function handleSubmit() {
    if (!billingId) return;

    const result = await createInvoice({ billingId });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    handleOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setBillingId("");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.INVOICE_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>

        <div>
          <Label className="mb-2">
            {t("form.billing")} <span className="text-destructive">*</span>
          </Label>
          <Select value={billingId} onValueChange={setBillingId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("form.billingPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {(billings?.items ?? []).map((billing) => (
                <SelectItem key={billing.id} value={billing.id}>
                  {formatCurrency(billing.amount, billing.currencyCode)} — {billing.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!billingId || isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tCommon("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
