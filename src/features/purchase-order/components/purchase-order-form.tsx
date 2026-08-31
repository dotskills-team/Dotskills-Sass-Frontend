"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  createPurchaseOrderSchema,
  type PurchaseOrderFormValues,
} from "@/features/purchase-order/schemas/purchase-order.schema";
import type { Supplier } from "@/types/supplier";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";

interface PurchaseOrderFormProps {
  defaultValues: PurchaseOrderFormValues;
  suppliers: Supplier[];
  locations: Location[];
  products: Product[];
  isSupplierEditable: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: PurchaseOrderFormValues) => void;
}

const EMPTY_ITEM = { productId: "", orderedQty: "", unitCost: "" };

/**
 * This project's first `useFieldArray` form (no prior precedent — a Line
 * item list is a genuinely different shape than every previous entity's
 * fixed field set). Products list is capped at the backend's own max
 * page size (200) rather than an unbounded fetch — still a real,
 * explicit bound (Section ১২.৩), not "fetch everything"; a searchable
 * combobox for a shop with 200+ active products is real future scope,
 * not built here.
 */
export function PurchaseOrderForm({
  defaultValues,
  suppliers,
  locations,
  products,
  isSupplierEditable,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: PurchaseOrderFormProps) {
  const t = useTranslations("purchaseOrders");

  const schema = createPurchaseOrderSchema({
    supplierRequired: t("form.supplierRequired"),
    locationRequired: t("form.locationRequired"),
    itemsMinOne: t("form.itemsMinOne"),
    productRequired: t("form.productRequired"),
    orderedQtyPositive: t("form.orderedQtyPositive"),
    unitCostNonNegative: t("form.unitCostNonNegative"),
  });

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const items = useWatch({ control: form.control, name: "items" });

  const orderTotal = items.reduce((sum, item) => {
    const qty = Number(item.orderedQty) || 0;
    const cost = Number(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.supplier")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!isSupplierEditable}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("form.supplierPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.location")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("form.locationPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.orderDate")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>{t("form.note")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t("form.notePlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("form.itemsTitle")}</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(EMPTY_ITEM)}
            >
              <Plus aria-hidden="true" />
              {t("form.addItem")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.formState.errors.items?.root && (
              <p className="text-sm text-destructive">{form.formState.errors.items.root.message}</p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 items-start gap-3 rounded-lg border border-border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <FormField
                  control={form.control}
                  name={`items.${index}.productId`}
                  render={({ field: itemField }) => (
                    <FormItem>
                      <FormLabel className="sm:hidden">{t("form.product")}</FormLabel>
                      <Select value={itemField.value} onValueChange={itemField.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("form.productPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.orderedQty`}
                  render={({ field: itemField }) => (
                    <FormItem>
                      <FormLabel className="sm:hidden">{t("form.orderedQty")}</FormLabel>
                      <FormControl>
                        <Input {...itemField} type="number" step="0.0001" min="0" placeholder={t("form.orderedQtyPlaceholder")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.unitCost`}
                  render={({ field: itemField }) => (
                    <FormItem>
                      <FormLabel className="sm:hidden">{t("form.unitCost")}</FormLabel>
                      <FormControl>
                        <Input {...itemField} type="number" step="0.0001" min="0" placeholder={t("form.unitCostPlaceholder")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  aria-label={t("form.removeItem")}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ))}

            <div className="flex justify-end border-t border-border pt-3 text-sm font-medium">
              {t("form.orderTotal")}: {orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
