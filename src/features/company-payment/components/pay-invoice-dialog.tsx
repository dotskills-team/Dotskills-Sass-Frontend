"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { useCreateCompanyPaymentMutation } from "@/features/company-payment/api/company-payment.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/formatters/currency";

interface PayInvoiceDialogProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: string;
  currencyCode: string;
}

/**
 * Payment flow: create → backend `{payment, gatewayPageUrl}` ফেরত দেয় → পুরো browser
 * gateway-এর hosted checkout page-এ full navigate করে (`window.location.href`, client-side
 * route নয় — SSLCommerz page আমাদের app-এর বাইরে)। এই component কখনো নিজে "payment
 * successful" declare করে না — success/failure সবসময় backend-এর gateway-verification থেকে
 * আসে, gateway থেকে ফিরে Payment History/Details page backend-confirmed state দেখায়।
 */
export function PayInvoiceDialog({ invoiceId, invoiceNumber, amount, currencyCode }: PayInvoiceDialogProps) {
  const t = useTranslations("companyPayments");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createPayment, { isLoading }] = useCreateCompanyPaymentMutation();

  async function handlePay() {
    const result = await createPayment({ invoiceId });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    window.location.href = result.data.gatewayPageUrl;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PAYMENT_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <CreditCard aria-hidden="true" />
            {t("pay.trigger")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pay.title")}</DialogTitle>
          <DialogDescription>
            {t("pay.description", { invoiceNumber, amount: formatCurrency(amount, currencyCode) })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handlePay} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("pay.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
