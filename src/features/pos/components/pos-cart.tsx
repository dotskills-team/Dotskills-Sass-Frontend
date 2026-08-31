"use client";

import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";

import type { CartLine } from "@/features/pos/hooks/use-cart";

interface PosCartProps {
  lines: CartLine[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onUpdateDiscount: (index: number, discountAmount: number) => void;
  onRemove: (index: number) => void;
}

export function PosCart({ lines, onUpdateQuantity, onUpdateDiscount, onRemove }: PosCartProps) {
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
          return (
            <TableRow key={`${line.productId}-${index}`}>
              <TableCell>
                <div className="font-medium text-foreground">{line.productName}</div>
                <div className="text-xs text-muted-foreground">{line.sku}</div>
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
