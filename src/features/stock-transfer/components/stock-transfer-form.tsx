"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
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
  createStockTransferSchema,
  type StockTransferFormValues,
} from "@/features/stock-transfer/schemas/stock-transfer.schema";
import { VariantPickerField } from "@/features/product/components/variant-picker-field";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";

const EMPTY_VALUES: StockTransferFormValues = {
  fromLocationId: "",
  toLocationId: "",
  productId: "",
  variantId: "",
  quantity: "",
};

interface StockTransferFormProps {
  companyId: string;
  locations: Location[];
  products: Product[];
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: StockTransferFormValues) => void;
}

/** Products list capped at the backend's own max page size (200), same bound already established for Purchase Order's item picker. */
export function StockTransferForm({
  companyId,
  locations,
  products,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: StockTransferFormProps) {
  const t = useTranslations("stockTransfers");

  const schema = createStockTransferSchema({
    fromLocationRequired: t("form.fromLocationRequired"),
    toLocationRequired: t("form.toLocationRequired"),
    sameLocation: t("form.sameLocation"),
    productRequired: t("form.productRequired"),
    quantityPositive: t("form.quantityPositive"),
  });

  const form = useForm<StockTransferFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedProductId = useWatch({ control: form.control, name: "productId" });
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="fromLocationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.fromLocation")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.fromLocationPlaceholder")} />
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
          name="toLocationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.toLocation")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.toLocationPlaceholder")} />
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
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.product")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
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

        {selectedProduct?.hasVariants && (
          <FormField
            control={form.control}
            name="variantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.variant")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <VariantPickerField
                    companyId={companyId}
                    product={selectedProduct}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.quantity")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.0001" min="0" placeholder={t("form.quantityPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
