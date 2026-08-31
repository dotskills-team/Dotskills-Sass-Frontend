"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { TenderLine } from "@/features/pos/hooks/use-tender";
import type { SalePaymentMethod } from "@/types/sale";

const PAYMENT_METHODS: SalePaymentMethod[] = ["CASH", "CARD", "BKASH", "NAGAD", "DUE"];

interface TenderSectionProps {
  lines: TenderLine[];
  total: number;
  entered: number;
  onAddLine: () => void;
  onUpdateMethod: (id: string, method: SalePaymentMethod) => void;
  onUpdateAmount: (id: string, amount: number) => void;
  onRemoveLine: (id: string) => void;
}

export function TenderSection({
  lines,
  total,
  entered,
  onAddLine,
  onUpdateMethod,
  onUpdateAmount,
  onRemoveLine,
}: TenderSectionProps) {
  const t = useTranslations("pos");
  const remaining = total - entered;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("tender.title")}</span>
        <Button type="button" variant="outline" size="sm" onClick={onAddLine}>
          <Plus aria-hidden="true" />
          {t("tender.addMethod")}
        </Button>
      </div>

      <div className="space-y-2">
        {lines.map((line) => (
          <div key={line.id} className="flex items-center gap-2">
            <Select value={line.method} onValueChange={(value) => onUpdateMethod(line.id, value as SalePaymentMethod)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {t(`paymentMethod.${method}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={line.amount}
              onChange={(event) => onUpdateAmount(line.id, Number(event.target.value))}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdateAmount(line.id, Math.max(0, remaining + line.amount))}
            >
              {t("tender.fillRemaining")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemoveLine(line.id)}
              disabled={lines.length <= 1}
              aria-label={t("tender.remove")}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-border pt-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("tender.total")}</span>
          <span className="tabular-nums">{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("tender.entered")}</span>
          <span className="tabular-nums">{entered.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>{t("tender.remaining")}</span>
          <span className={`tabular-nums ${Math.abs(remaining) < 0.01 ? "text-success" : "text-warning"}`}>
            {remaining.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
