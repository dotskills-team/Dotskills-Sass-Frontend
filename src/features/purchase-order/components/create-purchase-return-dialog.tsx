"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";

import { useCreatePurchaseReturnMutation } from "@/features/purchase-order/api/purchase-order.api";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { PurchaseOrder } from "@/types/purchase-order";
import type { Product } from "@/types/product";

function createReturnSchema(reasonRequired: string) {
  return z.object({
    reason: z.string().min(1, { error: reasonRequired }),
    refundAmount: z.string().optional().or(z.literal("")),
    quantity: z.record(z.string(), z.string()),
  });
}

type ReturnFormValues = z.infer<ReturnType<typeof createReturnSchema>>;

/** Only products already received on this order can be returned — each row is capped by that product's currently-received quantity (client hint; server is authoritative). */
export function CreatePurchaseReturnDialog({ companyId, order, products }: { companyId: string; order: PurchaseOrder; products: Product[] }) {
  const t = useTranslations("purchaseOrders");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [createPurchaseReturn, { isLoading }] = useCreatePurchaseReturnMutation();

  const receivedItems = order.items.filter((item) => Number(item.receivedQty) > 0);

  const form = useForm({
    resolver: zodResolver(createReturnSchema(t("returnDialog.reasonRequired"))),
    defaultValues: {
      reason: "",
      refundAmount: "",
      quantity: Object.fromEntries(receivedItems.map((item) => [item.productId, ""])),
    },
  });

  async function handleSubmit(values: ReturnFormValues) {
    const items = Object.entries(values.quantity)
      .filter(([, qty]) => qty && Number(qty) > 0)
      .map(([productId, qty]) => ({ productId, quantity: Number(qty) }));

    if (items.length === 0) return;

    const result = await createPurchaseReturn({
      companyId,
      id: order.id,
      body: { reason: values.reason.trim(), refundAmount: values.refundAmount ? Number(values.refundAmount) : undefined, items },
    });

    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }

    toast.success(t("returnDialog.success"));
    setOpen(false);
    form.reset();
  }

  if (receivedItems.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PURCHASE_RETURN_CREATE}>
        <DialogTrigger asChild>
          <Button variant="outline">{t("detail.returnAction")}</Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("returnDialog.title")}</DialogTitle>
          <DialogDescription>{t("returnDialog.description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("returnDialog.reason")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t("returnDialog.reasonPlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refundAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("returnDialog.refundAmount")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.0001" min="0" placeholder={t("returnDialog.refundAmountPlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("form.product")}</TableHead>
                  <TableHead>{t("receiveDialog.remainingLabel")}</TableHead>
                  <TableHead>{t("returnDialog.quantity")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivedItems.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{product?.name ?? item.productId}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{item.receivedQty}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0"
                          max={item.receivedQty}
                          placeholder={t("returnDialog.quantityPlaceholder")}
                          {...form.register(`quantity.${item.productId}`)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {t("returnDialog.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
