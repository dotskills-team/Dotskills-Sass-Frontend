"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useAddVariantAttributeValueMutation,
  useCreateVariantAttributeMutation,
  useListVariantAttributesQuery,
} from "@/features/variant-attribute/api/variant-attribute.api";
import { normalizeApiError } from "@/lib/api-error";

/**
 * Company-wide attribute catalog (Size, Color, ...), managed inline here
 * rather than as a separate settings page — attributes are almost always
 * created the moment someone needs them while building a variant product,
 * so a standalone page would just add a navigation detour with no real
 * benefit. Deletion is deliberately left out of this compact view (the
 * backend already blocks deleting an attribute/value that's in use, and a
 * destructive action buried in a "while I'm building a product" flow is
 * an easy way to lose data by accident) — attribute cleanup can be added
 * as its own small feature later if it turns out to be needed.
 */
export function AttributeManager({ companyId }: { companyId: string }) {
  const t = useTranslations("products");
  const { data: attributes, isLoading } = useListVariantAttributesQuery(companyId);
  const [createAttribute, { isLoading: isCreating }] = useCreateVariantAttributeMutation();
  const [addValue, { isLoading: isAddingValue }] = useAddVariantAttributeValueMutation();

  const [showNewAttribute, setShowNewAttribute] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValues, setNewValues] = useState("");
  const [newValueDrafts, setNewValueDrafts] = useState<Record<string, string>>({});

  async function handleCreateAttribute() {
    const values = newValues
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (!newName.trim() || values.length === 0) {
      toast.error(t("variants.attributeNameAndValuesRequired"));
      return;
    }
    const result = await createAttribute({ companyId, body: { name: newName.trim(), values } });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    setNewName("");
    setNewValues("");
    setShowNewAttribute(false);
  }

  async function handleAddValue(attributeId: string) {
    const value = (newValueDrafts[attributeId] ?? "").trim();
    if (!value) return;
    const result = await addValue({ companyId, attributeId, body: { value } });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    setNewValueDrafts((prev) => ({ ...prev, [attributeId]: "" }));
  }

  if (isLoading) return <Skeleton className="h-20 w-full" />;

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{t("variants.attributesTitle")}</h4>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowNewAttribute((v) => !v)}>
          <Plus className="size-3.5" aria-hidden="true" />
          {t("variants.newAttribute")}
        </Button>
      </div>

      {(attributes ?? []).length === 0 && !showNewAttribute && (
        <p className="text-sm text-muted-foreground">{t("variants.noAttributesYet")}</p>
      )}

      {(attributes ?? []).map((attribute) => (
        <div key={attribute.id} className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{attribute.name}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {attribute.values.map((value) => (
              <Badge key={value.id} variant="secondary">
                {value.value}
              </Badge>
            ))}
            <Input
              value={newValueDrafts[attribute.id] ?? ""}
              onChange={(e) => setNewValueDrafts((prev) => ({ ...prev, [attribute.id]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddValue(attribute.id);
                }
              }}
              placeholder={t("variants.addValuePlaceholder")}
              className="h-7 w-28 text-xs"
              disabled={isAddingValue}
            />
          </div>
        </div>
      ))}

      {showNewAttribute && (
        <div className="space-y-2 rounded-md border border-dashed border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">{t("variants.newAttribute")}</p>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setShowNewAttribute(false)}>
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("variants.attributeNamePlaceholder")} />
          <Input
            value={newValues}
            onChange={(e) => setNewValues(e.target.value)}
            placeholder={t("variants.attributeValuesPlaceholder")}
          />
          <Button type="button" size="sm" onClick={handleCreateAttribute} disabled={isCreating}>
            {t("variants.saveAttribute")}
          </Button>
        </div>
      )}
    </div>
  );
}
