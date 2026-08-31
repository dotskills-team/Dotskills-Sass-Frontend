"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "@/features/product/components/product-form";
import { useUpdateProductMutation } from "@/features/product/api/product.api";
import { toProductPayload } from "@/features/product/lib/product-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { ProductFormValues } from "@/features/product/schemas/product.schema";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { Unit } from "@/types/unit";

interface EditProductDialogProps {
  companyId: string;
  product: Product;
  categories: Category[];
  units: Unit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({ companyId, product, categories, units, open, onOpenChange }: EditProductDialogProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  async function handleSubmit(values: ProductFormValues) {
    const payload = toProductPayload(values);
    const result = await updateProduct({
      companyId,
      id: product.id,
      body: {
        name: payload.name,
        categoryId: payload.categoryId,
        baseUnitId: payload.baseUnitId,
        barcode: payload.barcode,
        costPrice: payload.costPrice,
        salePrice: payload.salePrice,
        reorderLevel: payload.reorderLevel,
        sellByWeight: payload.sellByWeight,
      },
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.editSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("form.editTitle")}</DialogTitle>
          <DialogDescription>{t("form.editDescription", { name: product.name })}</DialogDescription>
        </DialogHeader>
        <ProductForm
          defaultValues={{
            sku: product.sku,
            name: product.name,
            categoryId: product.categoryId ?? "",
            baseUnitId: product.baseUnitId,
            barcode: product.barcode ?? "",
            costPrice: product.costPrice,
            salePrice: product.salePrice,
            reorderLevel: product.reorderLevel,
            sellByWeight: product.sellByWeight,
          }}
          categories={categories}
          units={units}
          isSkuEditable={false}
          isSubmitting={isLoading}
          submitLabel={tCommon("update")}
          cancelLabel={tCommon("cancel")}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
