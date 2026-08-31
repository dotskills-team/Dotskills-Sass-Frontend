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
import { CategoryForm } from "@/features/category/components/category-form";
import { useCreateCategoryMutation } from "@/features/category/api/category.api";
import { toCategoryPayload } from "@/features/category/lib/category-form-mapper";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { CategoryFormValues } from "@/features/category/schemas/category.schema";
import type { Category } from "@/types/category";

const EMPTY_VALUES: CategoryFormValues = { name: "", parentCategoryId: "" };

export function CreateCategoryDialog({ companyId, categories }: { companyId: string; categories: Category[] }) {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  async function handleSubmit(values: CategoryFormValues) {
    const result = await createCategory({ companyId, body: toCategoryPayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CATEGORY_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <CategoryForm
          defaultValues={EMPTY_VALUES}
          candidateParents={categories}
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
