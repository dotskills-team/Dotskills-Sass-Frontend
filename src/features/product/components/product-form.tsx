"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { createProductSchema, type ProductFormValues } from "@/features/product/schemas/product.schema";
import type { Category } from "@/types/category";
import type { Unit } from "@/types/unit";

interface ProductFormProps {
  defaultValues: ProductFormValues;
  categories: Category[];
  units: Unit[];
  isSkuEditable: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

const NONE_VALUE = "__none__";

export function ProductForm({
  defaultValues,
  categories,
  units,
  isSkuEditable,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const t = useTranslations("products");

  const schema = createProductSchema({
    skuRequired: t("form.skuRequired"),
    skuLength: t("form.skuLength"),
    nameRequired: t("form.nameRequired"),
    nameLength: t("form.nameLength"),
    baseUnitRequired: t("form.baseUnitRequired"),
    pricePositive: t("form.pricePositive"),
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.sku")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("form.skuPlaceholder")} disabled={!isSkuEditable} />
                </FormControl>
                {!isSkuEditable && <FormDescription>{t("form.skuDescription")}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.barcode")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("form.barcodePlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.name")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.namePlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.category")}</FormLabel>
                <Select
                  value={field.value || NONE_VALUE}
                  onValueChange={(value) => field.onChange(value === NONE_VALUE ? "" : value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("form.categoryPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>{t("form.categoryNone")}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
            name="baseUnitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.baseUnit")} <span className="text-destructive">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("form.baseUnitPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.costPrice")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder={t("form.costPricePlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.salePrice")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder={t("form.salePricePlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.reorderLevel")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="1" min="0" placeholder={t("form.reorderLevelPlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormDescription>{t("form.reorderLevelDescription")}</FormDescription>

        <FormField
          control={form.control}
          name="sellByWeight"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">{t("form.sellByWeight")}</FormLabel>
                <FormDescription>{t("form.sellByWeightDescription")}</FormDescription>
              </div>
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
