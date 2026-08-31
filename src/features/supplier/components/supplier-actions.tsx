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
import { EditSupplierDialog } from "@/features/supplier/components/edit-supplier-dialog";
import { RecordSupplierPaymentDialog } from "@/features/supplier-payment/components/record-supplier-payment-dialog";
import { useUpdateSupplierMutation } from "@/features/supplier/api/supplier.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { Supplier } from "@/types/supplier";

type ActiveAction = "edit" | "activate" | "deactivate" | "recordPayment" | null;

export function SupplierRowActions({ companyId, supplier }: { companyId: string; supplier: Supplier }) {
  const t = useTranslations("suppliers");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [updateSupplier, { isLoading }] = useUpdateSupplierMutation();

  async function handleStatusToggle(status: "ACTIVE" | "INACTIVE") {
    const result = await updateSupplier({ companyId, id: supplier.id, body: { status } });
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
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUPPLIER_UPDATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("edit")}>{t("actions.edit")}</DropdownMenuItem>
            {supplier.status === "ACTIVE" ? (
              <DropdownMenuItem onSelect={() => setActiveAction("deactivate")}>
                {t("actions.deactivate")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => setActiveAction("activate")}>
                {t("actions.activate")}
              </DropdownMenuItem>
            )}
          </CompanyPermissionGate>
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUPPLIER_PAYMENT_CREATE}>
            <DropdownMenuItem onSelect={() => setActiveAction("recordPayment")}>
              {t("actions.recordPayment")}
            </DropdownMenuItem>
          </CompanyPermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={activeAction === "activate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.activateTitle")}
        description={t("actions.activateDescription", { name: supplier.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isLoading}
        onConfirm={() => handleStatusToggle("ACTIVE")}
      />

      <ActionConfirmDialog
        open={activeAction === "deactivate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.deactivateTitle")}
        description={t("actions.deactivateDescription", { name: supplier.name })}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isLoading}
        onConfirm={() => handleStatusToggle("INACTIVE")}
      />

      <EditSupplierDialog
        companyId={companyId}
        supplier={supplier}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />

      <RecordSupplierPaymentDialog
        companyId={companyId}
        supplier={supplier}
        open={activeAction === "recordPayment"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />
    </>
  );
}
