"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";

import { AttributeManager } from "@/features/variant-attribute/components/attribute-manager";
import { useListVariantAttributesQuery } from "@/features/variant-attribute/api/variant-attribute.api";
import {
  useCreateProductVariantMutation,
  useListProductVariantsQuery,
  useRemoveProductVariantMutation,
  useUpdateProductVariantMutation,
} from "@/features/product/api/product-variant.api";
import { EMPTY_VARIANT_DRAFT, VariantFormFields, type VariantDraft } from "@/features/product/components/variant-form-fields";
import { formatVariantLabel } from "@/features/product/lib/format-variant-label";
import { normalizeApiError } from "@/lib/api-error";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";

interface ManageVariantsDialogProps {
  companyId: string;
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDraft(variant: ProductVariant): VariantDraft {
  const attributeValues: Record<string, string> = {};
  for (const v of variant.attributeValues) attributeValues[v.attributeValue.attribute.id] = v.attributeValue.id;
  return {
    sku: variant.sku,
    barcode: variant.barcode ?? "",
    costPrice: variant.costPrice,
    salePrice: variant.salePrice,
    attributeValues,
  };
}

export function ManageVariantsDialog({ companyId, product, open, onOpenChange }: ManageVariantsDialogProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");

  const { data: attributes } = useListVariantAttributesQuery(companyId, { skip: !open });
  const { data: variants, isLoading } = useListProductVariantsQuery(
    { companyId, productId: product.id },
    { skip: !open },
  );
  const [createVariant, { isLoading: isCreating }] = useCreateProductVariantMutation();
  const [updateVariant, { isLoading: isUpdating }] = useUpdateProductVariantMutation();
  const [removeVariant, { isLoading: isRemoving }] = useRemoveProductVariantMutation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addDraft, setAddDraft] = useState<VariantDraft>(EMPTY_VARIANT_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<VariantDraft>(EMPTY_VARIANT_DRAFT);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function draftToPayload(draft: VariantDraft) {
    return {
      sku: draft.sku.trim(),
      barcode: draft.barcode.trim() || undefined,
      costPrice: Number(draft.costPrice) || 0,
      salePrice: Number(draft.salePrice) || 0,
      attributeValueIds: Object.values(draft.attributeValues).filter(Boolean),
    };
  }

  async function handleCreate() {
    const payload = draftToPayload(addDraft);
    if (!payload.sku || payload.attributeValueIds.length === 0) {
      toast.error(t("variants.skuAndAttributesRequired"));
      return;
    }
    const result = await createVariant({ companyId, productId: product.id, body: payload });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("variants.createSuccess"));
    setAddDraft(EMPTY_VARIANT_DRAFT);
    setShowAddForm(false);
  }

  async function handleUpdate(id: string) {
    const payload = draftToPayload(editDraft);
    if (payload.attributeValueIds.length === 0) {
      toast.error(t("variants.skuAndAttributesRequired"));
      return;
    }
    const result = await updateVariant({
      companyId,
      productId: product.id,
      id,
      body: {
        barcode: payload.barcode,
        costPrice: payload.costPrice,
        salePrice: payload.salePrice,
        attributeValueIds: payload.attributeValueIds,
      },
    });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("variants.updateSuccess"));
    setEditingId(null);
  }

  async function handleDelete() {
    if (!pendingDeleteId) return;
    const result = await removeVariant({ companyId, productId: product.id, id: pendingDeleteId });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      setPendingDeleteId(null);
      return;
    }
    toast.success(t("variants.deleteSuccess"));
    setPendingDeleteId(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("variants.title", { name: product.name })}</DialogTitle>
          <DialogDescription>{t("variants.description")}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <AttributeManager companyId={companyId} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{t("variants.variantsTitle")}</h4>
              {!showAddForm && (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                  <Plus className="size-3.5" aria-hidden="true" />
                  {t("variants.addVariant")}
                </Button>
              )}
            </div>

            {showAddForm && (
              <div className="space-y-2 rounded-md border border-dashed border-border p-3">
                <VariantFormFields
                  attributes={attributes ?? []}
                  draft={addDraft}
                  onChange={setAddDraft}
                  isSkuEditable
                />
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={handleCreate} disabled={isCreating}>
                    {isCreating && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                    {tCommon("save")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddDraft(EMPTY_VARIANT_DRAFT);
                    }}
                  >
                    {tCommon("cancel")}
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (variants ?? []).length === 0 ? (
              <EmptyState title={t("variants.empty")} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("variants.sku")}</TableHead>
                    <TableHead>{t("variants.attributesTitle")}</TableHead>
                    <TableHead className="text-right">{t("form.costPrice")}</TableHead>
                    <TableHead className="text-right">{t("form.salePrice")}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(variants ?? []).map((variant) =>
                    editingId === variant.id ? (
                      <TableRow key={variant.id}>
                        <TableCell colSpan={5}>
                          <div className="space-y-2 py-2">
                            <VariantFormFields
                              attributes={attributes ?? []}
                              draft={editDraft}
                              onChange={setEditDraft}
                              isSkuEditable={false}
                            />
                            <div className="flex gap-2">
                              <Button type="button" size="sm" onClick={() => handleUpdate(variant.id)} disabled={isUpdating}>
                                {isUpdating && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                                {tCommon("save")}
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                                {tCommon("cancel")}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={variant.id}>
                        <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{formatVariantLabel(variant)}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{Number(variant.costPrice).toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(variant.salePrice).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setEditingId(variant.id);
                                setEditDraft(toDraft(variant));
                              }}
                              aria-label={tCommon("edit")}
                            >
                              <Pencil className="size-3.5" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setPendingDeleteId(variant.id)}
                              aria-label={tCommon("delete")}
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <ActionConfirmDialog
          open={!!pendingDeleteId}
          onOpenChange={(nextOpen) => !nextOpen && setPendingDeleteId(null)}
          title={t("variants.deleteTitle")}
          description={t("variants.deleteDescription")}
          confirmLabel={tCommon("delete")}
          cancelLabel={tCommon("cancel")}
          isLoading={isRemoving}
          onConfirm={handleDelete}
        />
      </DialogContent>
    </Dialog>
  );
}
