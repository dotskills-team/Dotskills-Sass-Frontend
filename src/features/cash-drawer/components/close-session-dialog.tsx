"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCloseCashDrawerSessionMutation } from "@/features/cash-drawer/api/cash-drawer.api";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import { cn } from "@/lib/utils";
import type { CashDrawerSession } from "@/types/cash-drawer-session";

function formatSigned(value: number): string {
  const formatted = Math.abs(value).toLocaleString();
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
}

/**
 * Never rejects on a non-zero variance — only displays it. Deliberately
 * uses one neutral "info" tone for any non-zero difference rather than
 * magnitude-tiered amber/red: no variance-magnitude threshold exists
 * anywhere in CompanySettings or the design doc to base tiering on, and
 * inventing one would be a guess (flagged in the phase plan).
 */
export function CloseSessionDialog({
  companyId,
  session,
  open,
  onOpenChange,
}: {
  companyId: string;
  session: CashDrawerSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("cashDrawer");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [actualClosingBalance, setActualClosingBalance] = useState("");
  const [note, setNote] = useState("");
  const [closedResult, setClosedResult] = useState<CashDrawerSession | null>(null);
  const [closeSession, { isLoading }] = useCloseCashDrawerSessionMutation();

  async function handleSubmit() {
    if (!actualClosingBalance) {
      toast.error(t("close.actualClosingBalanceRequired"));
      return;
    }

    const result = await closeSession({
      companyId,
      id: session.id,
      body: { actualClosingBalance: Number(actualClosingBalance), note: note.trim() || undefined },
    });

    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }

    setClosedResult(result.data);
    toast.success(t("close.success"));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setClosedResult(null);
      setActualClosingBalance("");
      setNote("");
    }
    onOpenChange(nextOpen);
  }

  const variance = closedResult ? Number(closedResult.variance) : 0;
  const isBalanced = variance === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("close.title")}</DialogTitle>
          <DialogDescription>{t("close.description")}</DialogDescription>
        </DialogHeader>

        {closedResult ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">{t("close.expected")}</div>
                <div className="tabular-nums font-medium text-foreground">
                  {Number(closedResult.expectedClosingBalance).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">{t("close.actual")}</div>
                <div className="tabular-nums font-medium text-foreground">
                  {Number(closedResult.actualClosingBalance).toLocaleString()}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "rounded-md border p-3 text-sm",
                isBalanced ? "border-success/30 bg-success/10 text-success" : "border-info/30 bg-info/10 text-info",
              )}
            >
              {isBalanced ? t("close.balanced") : t("close.variance", { amount: formatSigned(variance) })}
            </div>

            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>{tCommon("close")}</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("close.actualClosingBalance")} <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={actualClosingBalance}
                onChange={(event) => setActualClosingBalance(event.target.value)}
                placeholder={t("close.actualClosingBalancePlaceholder")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("close.note")}</label>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("close.notePlaceholder")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {t("close.submit")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
