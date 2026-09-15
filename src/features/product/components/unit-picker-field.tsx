"use client";

import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListUnitsQuery } from "@/features/unit/api/unit.api";
import type { Product } from "@/types/product";

interface UnitPickerFieldProps {
  companyId: string;
  product: Product | undefined;
  value: string;
  onChange: (unitId: string) => void;
}

const BASE_UNIT_VALUE = "__base__";

/**
 * Lets a Purchase/Sale line be entered in a different Unit than the
 * Product's own base unit (e.g. buying by "Carton" for a Product tracked
 * in "Piece") — the backend converts to the base unit automatically
 * (`UnitConversionService`). Only Units whose own `baseUnitId` directly
 * equals this Product's base unit are offered (mirrors the backend's
 * "one level of nesting only" rule) — a Unit from an unrelated family
 * (e.g. "Meter") is never shown, since selecting it would fail server
 * validation anyway.
 *
 * Renders nothing when the company has no such derived units for this
 * product's base unit — the common case for most products, matching
 * `VariantPickerField`'s same "nothing to pick, render nothing" rule.
 */
export function UnitPickerField({ companyId, product, value, onChange }: UnitPickerFieldProps) {
  const t = useTranslations("products");
  const { data: units } = useListUnitsQuery(companyId, { skip: !companyId });

  const baseUnit = units?.find((u) => u.id === product?.baseUnitId);
  const derivedUnits = (units ?? []).filter((u) => u.baseUnitId === product?.baseUnitId);

  if (!product || derivedUnits.length === 0) return null;

  return (
    <Select value={value || BASE_UNIT_VALUE} onValueChange={(v) => onChange(v === BASE_UNIT_VALUE ? "" : v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("variants.selectUnitPlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={BASE_UNIT_VALUE}>{baseUnit?.name ?? t("variants.baseUnitOption")}</SelectItem>
        {derivedUnits.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            {unit.name} ({unit.conversionFactor}x)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
