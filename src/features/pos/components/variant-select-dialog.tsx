"use client";

import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

import { useListProductVariantsQuery } from "@/features/product/api/product-variant.api";
import { formatVariantLabel } from "@/features/product/lib/format-variant-label";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";

interface VariantSelectDialogProps {
  companyId: string;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onSelectVariant: (variant: ProductVariant) => void;
}

/**
 * Picking from the actual list of existing variants (not two independent
 * Size/Color chip pickers) — this is the deliberate, safer choice:
 * independent attribute pickers could let a cashier land on a combination
 * that was never created as a real variant (e.g. a Green that only ever
 * exists in Size M, not S). A flat list of real `ProductVariant` rows can
 * never produce an invalid selection.
 */
export function VariantSelectDialog({ companyId, product, onOpenChange, onSelectVariant }: VariantSelectDialogProps) {
  const t = useTranslations("pos");
  const open = product !== null;

  const { data: variants, isLoading } = useListProductVariantsQuery(
    { companyId, productId: product?.id ?? "" },
    { skip: !open },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("variantDialog.title", { name: product?.name ?? "" })}</DialogTitle>
          <DialogDescription>{t("variantDialog.description")}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (variants ?? []).length === 0 ? (
          <EmptyState title={t("variantDialog.empty")} />
        ) : (
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {(variants ?? []).map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelectVariant(variant)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-accent",
                )}
              >
                <span>
                  {formatVariantLabel(variant)} <span className="text-muted-foreground">({variant.sku})</span>
                </span>
                <span className="tabular-nums text-muted-foreground">{Number(variant.salePrice).toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
