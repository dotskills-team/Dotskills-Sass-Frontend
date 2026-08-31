"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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

import { StockTransferForm } from "@/features/stock-transfer/components/stock-transfer-form";
import { useCreateStockTransferMutation } from "@/features/stock-transfer/api/stock-transfer.api";
import { toStockTransferPayload } from "@/features/stock-transfer/lib/stock-transfer-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";
import type { StockTransferFormValues } from "@/features/stock-transfer/schemas/stock-transfer.schema";

export function CreateStockTransferDialog({
  companyId,
  locations,
  products,
}: {
  companyId: string;
  locations: Location[];
  products: Product[];
}) {
  const t = useTranslations("stockTransfers");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [createStockTransfer, { isLoading }] = useCreateStockTransferMutation();

  async function handleSubmit(values: StockTransferFormValues) {
    const result = await createStockTransfer({ companyId, body: toStockTransferPayload(values) });

    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.STOCK_TRANSFER_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("createTrigger")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <StockTransferForm
          locations={locations}
          products={products}
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
