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
import { CategoryForm } from "@/features/category/components/category-form";
import { useUpdateCategoryMutation } from "@/features/category/api/category.api";
import { toCategoryPayload } from "@/features/category/lib/category-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { CategoryFormValues } from "@/features/category/schemas/category.schema";
import type { Category } from "@/types/category";

interface EditCategoryDialogProps {
  companyId: string;
  category: Category;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCategoryDialog({ companyId, category, categories, open, onOpenChange }: EditCategoryDialogProps) {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  async function handleSubmit(values: CategoryFormValues) {
    const result = await updateCategory({ companyId, id: category.id, body: toCategoryPayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.editSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.editTitle")}</DialogTitle>
          <DialogDescription>{t("form.editDescription", { name: category.name })}</DialogDescription>
        </DialogHeader>
        <CategoryForm
          defaultValues={{ name: category.name, parentCategoryId: category.parentCategoryId ?? "" }}
          candidateParents={categories.filter((candidate) => candidate.id !== category.id)}
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
