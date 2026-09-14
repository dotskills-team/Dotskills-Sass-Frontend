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

import { useCreateSaleReturnMutation } from "@/features/sale/api/sale.api";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { Sale } from "@/types/sale";

function createReturnSchema(reasonRequired: string) {
  return z.object({
    reason: z.string().min(1, { error: reasonRequired }),
    refundAmount: z.string().optional().or(z.literal("")),
    quantity: z.record(z.string(), z.string()),
  });
}

type ReturnFormValues = z.infer<ReturnType<typeof createReturnSchema>>;

/** Quantity per line is capped at what was originally sold — a client hint only; the server is authoritative and doesn't track cumulative already-returned quantity per SaleItem. */
export function CreateSaleReturnDialog({ companyId, sale }: { companyId: string; sale: Sale }) {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [createSaleReturn, { isLoading }] = useCreateSaleReturnMutation();

  const form = useForm({
    resolver: zodResolver(createReturnSchema(t("returnDialog.reasonRequired"))),
    defaultValues: {
      reason: "",
      refundAmount: "",
      // Keyed by the SaleItem's own id, not productId — a sale can have two
      // separate lines for the same product in different variants (e.g.
      // Red/S and Blue/S of the same T-Shirt), which would otherwise
      // collide on a bare productId key.
      quantity: Object.fromEntries(sale.items.map((item) => [item.id, ""])),
    },
  });

  async function handleSubmit(values: ReturnFormValues) {
    const itemsById = new Map(sale.items.map((item) => [item.id, item]));
    const items = Object.entries(values.quantity)
      .filter(([, qty]) => qty && Number(qty) > 0)
      .map(([saleItemId, qty]) => {
        const saleItem = itemsById.get(saleItemId)!;
        return {
          productId: saleItem.productId,
          variantId: saleItem.variantId ?? undefined,
          quantity: Number(qty),
        };
      });

    if (items.length === 0) return;

    const result = await createSaleReturn({
      companyId,
      id: sale.id,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SALE_RETURN_CREATE}>
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
                  <TableHead>{t("receipt.item")}</TableHead>
                  <TableHead>{t("returnDialog.quantitySold")}</TableHead>
                  <TableHead>{t("returnDialog.quantity")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0"
                        max={item.quantity}
                        placeholder={t("returnDialog.quantityPlaceholder")}
                        {...form.register(`quantity.${item.id}`)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                {tCommon("cancel")}
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
