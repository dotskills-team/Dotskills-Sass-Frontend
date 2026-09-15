"use client";

import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";

import type { CartLine } from "@/features/pos/hooks/use-cart";
import type { Unit } from "@/types/unit";

const BASE_UNIT_VALUE = "__base__";

interface PosCartProps {
  lines: CartLine[];
  units: Unit[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onUpdateDiscount: (index: number, discountAmount: number) => void;
  onUpdateSerialNote: (index: number, serialNote: string) => void;
  onUpdateUnit: (index: number, unit: { id: string; name: string; conversionFactor: number } | undefined) => void;
  onRemove: (index: number) => void;
}

export function PosCart({ lines, units, onUpdateQuantity, onUpdateDiscount, onUpdateSerialNote, onUpdateUnit, onRemove }: PosCartProps) {
  const t = useTranslations("pos");

  if (lines.length === 0) {
    return <EmptyState title={t("cartEmpty")} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("cart.product")}</TableHead>
          <TableHead>{t("cart.quantity")}</TableHead>
          <TableHead className="text-right">{t("cart.unitPrice")}</TableHead>
          <TableHead>{t("cart.discount")}</TableHead>
          <TableHead className="text-right">{t("cart.subtotal")}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line, index) => {
          const subtotal = line.quantity * line.unitPrice - line.discountAmount;
          const derivedUnits = units.filter((u) => u.baseUnitId === line.baseUnitId);
          return (
            <TableRow key={`${line.productId}-${index}`}>
              <TableCell>
                <div className="font-medium text-foreground">
                  {line.productName}
                  {line.variantLabel && <span className="text-muted-foreground"> — {line.variantLabel}</span>}
                </div>
                <div className="text-xs text-muted-foreground">{line.sku}</div>
                {derivedUnits.length > 0 && (
                  <Select
                    value={line.unitId ?? BASE_UNIT_VALUE}
                    onValueChange={(value) =>
                      onUpdateUnit(
                        index,
                        value === BASE_UNIT_VALUE
                          ? undefined
                          : (() => {
                              const unit = derivedUnits.find((u) => u.id === value)!;
                              return { id: unit.id, name: unit.name, conversionFactor: Number(unit.conversionFactor) };
                            })(),
                      )
                    }
                  >
                    <SelectTrigger className="mt-1 h-7 w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BASE_UNIT_VALUE}>{t("cart.baseUnitOption")}</SelectItem>
                      {derivedUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.conversionFactor}x)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Input
                  value={line.serialNote ?? ""}
                  onChange={(event) => onUpdateSerialNote(index, event.target.value)}
                  placeholder={t("cart.serialNotePlaceholder")}
                  className="mt-1 h-7 text-xs"
                />
              </TableCell>
              <TableCell>
                {line.sellByWeight ? (
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    value={line.quantity}
                    onChange={(event) => onUpdateQuantity(index, Number(event.target.value))}
                    className="w-28"
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onUpdateQuantity(index, Math.max(1, line.quantity - 1))}
                      aria-label={t("cart.decrease")}
                    >
                      <Minus className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={line.quantity}
                      onChange={(event) => onUpdateQuantity(index, Number(event.target.value))}
                      className="w-16 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onUpdateQuantity(index, line.quantity + 1)}
                      aria-label={t("cart.increase")}
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">{line.unitPrice.toLocaleString()}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={line.discountAmount}
                  onChange={(event) => onUpdateDiscount(index, Number(event.target.value))}
                  className="w-24"
                />
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">{subtotal.toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(index)}
                  aria-label={t("cart.remove")}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
