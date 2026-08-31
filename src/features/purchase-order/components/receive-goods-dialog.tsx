"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CompanyPermissionGate } from "@/components/shared/permission-gate";

import { useReceiveGoodsMutation } from "@/features/purchase-order/api/purchase-order.api";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { PurchaseOrder } from "@/types/purchase-order";
import type { Product } from "@/types/product";

interface ReceiveGoodsFormValues {
  receivedDate: string;
  receivedQty: Record<string, string>;
}

/**
 * No `useFieldArray` here — the row set is fixed (one row per existing
 * `PurchaseOrderItem`, never user-added/removed), unlike the Create
 * form's genuinely variable-length item list. The remaining-per-line cap
 * is enforced via the input's `max` attribute (client UX only) — the
 * server is authoritative (Gap 3's over-receive message is the real
 * gate, translated via `resolveBusinessErrorMessage`).
 */
export function ReceiveGoodsDialog({ companyId, order, products }: { companyId: string; order: PurchaseOrder; products: Product[] }) {
  const t = useTranslations("purchaseOrders");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [receiveGoods, { isLoading }] = useReceiveGoodsMutation();

  const receivableItems = order.items.filter((item) => Number(item.receivedQty) < Number(item.orderedQty));

  const form = useForm<ReceiveGoodsFormValues>({
    defaultValues: {
      receivedDate: new Date().toISOString().slice(0, 10),
      receivedQty: Object.fromEntries(receivableItems.map((item) => [item.id, ""])),
    },
  });

  async function handleSubmit(values: ReceiveGoodsFormValues) {
    const items = Object.entries(values.receivedQty)
      .filter(([, qty]) => qty && Number(qty) > 0)
      .map(([purchaseOrderItemId, qty]) => ({ purchaseOrderItemId, receivedQty: Number(qty) }));

    if (items.length === 0) return;

    const result = await receiveGoods({ companyId, id: order.id, body: { receivedDate: values.receivedDate, items } });
    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }

    toast.success(t("receiveDialog.success"));
    setOpen(false);
    form.reset();
  }

  if (receivableItems.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PURCHASE_ORDER_RECEIVE}>
        <DialogTrigger asChild>
          <Button>{t("detail.receiveAction")}</Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("receiveDialog.title")}</DialogTitle>
          <DialogDescription>{t("receiveDialog.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="receivedDate" className="text-sm font-medium">
              {t("receiveDialog.receivedDate")}
            </label>
            <Input id="receivedDate" type="date" {...form.register("receivedDate")} className="mt-1" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("form.product")}</TableHead>
                <TableHead>{t("receiveDialog.remainingLabel")}</TableHead>
                <TableHead>{t("receiveDialog.receivedQty")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivableItems.map((item) => {
                const remaining = Number(item.orderedQty) - Number(item.receivedQty);
                const product = products.find((p) => p.id === item.productId);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{product?.name ?? item.productId}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{t("receiveDialog.remaining", { remaining })}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0"
                        max={remaining}
                        placeholder={t("receiveDialog.receivedQtyPlaceholder")}
                        {...form.register(`receivedQty.${item.id}`)}
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
              {t("receiveDialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
