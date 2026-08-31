"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ProductForm } from "@/features/product/components/product-form";
import { useCreateProductMutation } from "@/features/product/api/product.api";
import { toProductPayload } from "@/features/product/lib/product-form-mapper";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { ProductFormValues } from "@/features/product/schemas/product.schema";
import type { Category } from "@/types/category";
import type { Unit } from "@/types/unit";

const EMPTY_VALUES: ProductFormValues = {
  sku: "",
  name: "",
  categoryId: "",
  baseUnitId: "",
  barcode: "",
  costPrice: "",
  salePrice: "",
  reorderLevel: "",
  sellByWeight: false,
};

export function CreateProductDialog({
  companyId,
  categories,
  units,
}: {
  companyId: string;
  categories: Category[];
  units: Unit[];
}) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createProduct, { isLoading }] = useCreateProductMutation();

  async function handleSubmit(values: ProductFormValues) {
    const result = await createProduct({ companyId, body: toProductPayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PRODUCT_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <ProductForm
          defaultValues={EMPTY_VALUES}
          categories={categories}
          units={units}
          isSkuEditable
          isSubmitting={isLoading}
          submitLabel={tCommon("create")}
          cancelLabel={tCommon("cancel")}
          onCancel={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
