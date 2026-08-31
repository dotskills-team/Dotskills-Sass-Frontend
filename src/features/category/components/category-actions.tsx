"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";
import { EditCategoryDialog } from "@/features/category/components/edit-category-dialog";
import { useUpdateCategoryMutation } from "@/features/category/api/category.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { Category } from "@/types/category";

type ActiveAction = "edit" | "activate" | "deactivate" | null;

export function CategoryRowActions({
  companyId,
  category,
  categories,
}: {
  companyId: string;
  category: Category;
  categories: Category[];
}) {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  async function handleStatusToggle(status: "ACTIVE" | "INACTIVE") {
    const result = await updateCategory({ companyId, id: category.id, body: { name: category.name, status } });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(status === "ACTIVE" ? t("actions.activateSuccess") : t("actions.deactivateSuccess"));
    setActiveAction(null);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={tCommon("actions")}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CATEGORY_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>{t("actions.edit")}</DropdownMenuItem>
            {category.status === "ACTIVE" ? (
              <DropdownMenuItem onSelect={() => setActiveAction("deactivate")}>
                {t("actions.deactivate")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => setActiveAction("activate")}>
                {t("actions.activate")}
              </DropdownMenuItem>
            )}
          </CompanyPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "activate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.activateTitle")}
        description={t("actions.activateDescription", { name: category.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isLoading}
        onConfirm={() => handleStatusToggle("ACTIVE")}
      />

      <ActionConfirmDialog
        open={activeAction === "deactivate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.deactivateTitle")}
        description={t("actions.deactivateDescription", { name: category.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isLoading}
        onConfirm={() => handleStatusToggle("INACTIVE")}
      />

      <EditCategoryDialog
        companyId={companyId}
        category={category}
        categories={categories}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />
    </>
  );
}
