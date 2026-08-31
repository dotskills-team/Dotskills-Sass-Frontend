"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  createSupplierPaymentSchema,
  type SupplierPaymentFormValues,
} from "@/features/supplier-payment/schemas/supplier-payment.schema";
import { useRecordSupplierPaymentMutation } from "@/features/supplier-payment/api/supplier-payment.api";
import { toSupplierPaymentPayload } from "@/features/supplier-payment/lib/supplier-payment-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import type { Supplier } from "@/types/supplier";

interface RecordSupplierPaymentDialogProps {
  companyId: string;
  supplier: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordSupplierPaymentDialog({ companyId, supplier, open, onOpenChange }: RecordSupplierPaymentDialogProps) {
  const t = useTranslations("suppliers");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [recordSupplierPayment, { isLoading }] = useRecordSupplierPaymentMutation();

  const schema = createSupplierPaymentSchema({ amountPositive: t("paymentDialog.amountPositive") });

  const form = useForm<SupplierPaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", note: "" },
  });

  async function handleSubmit(values: SupplierPaymentFormValues) {
    const result = await recordSupplierPayment({ companyId, body: toSupplierPaymentPayload(supplier.id, values) });

    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }

    toast.success(t("paymentDialog.success"));
    onOpenChange(false);
    form.reset({ amount: "", note: "" });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset({ amount: "", note: "" });
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("paymentDialog.title", { name: supplier.name })}</DialogTitle>
          <DialogDescription>
            {t("paymentDialog.description", { balance: Number(supplier.payableBalance).toLocaleString() })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("paymentDialog.amount")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.0001" min="0" placeholder={t("paymentDialog.amountPlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("paymentDialog.note")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t("paymentDialog.notePlaceholder")} />
                  </FormControl>
                  <FormDescription>{t("paymentDialog.balanceNote")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {t("paymentDialog.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
