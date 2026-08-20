"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";
import { CreatePlanPriceDialog } from "@/features/plan-price/components/create-plan-price-dialog";
import { EditPlanPriceDialog } from "@/features/plan-price/components/edit-plan-price-dialog";
import {
  useListPlanPricesQuery,
  useActivatePlanPriceMutation,
  useDeactivatePlanPriceMutation,
} from "@/features/plan-price/api/plan-price.api";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { PlanPrice } from "@/types/platform";

type ActiveAction = { type: "edit" | "activate" | "deactivate"; price: PlanPrice } | null;

/** Plan Details page-এর Pricing section — নিজস্ব `PlanPrice` tag দিয়ে independently refresh হয়। */
export function PlanPricingSection({ planId }: { planId: string }) {
  const t = useTranslations("planPrices");
  const tCommon = useTranslations("common");
  const { data, isLoading, error, refetch } = useListPlanPricesQuery({ planId });
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [activate, { isLoading: isActivating }] = useActivatePlanPriceMutation();
  const [deactivate, { isLoading: isDeactivating }] = useDeactivatePlanPriceMutation();

  async function handleActivate() {
    if (!activeAction) return;
    const result = await activate({ planId, priceId: activeAction.price.id });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.activateSuccess"));
    setActiveAction(null);
  }

  async function handleDeactivate() {
    if (!activeAction) return;
    const result = await deactivate({ planId, priceId: activeAction.price.id });
    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.deactivateSuccess"));
    setActiveAction(null);
  }

  return (
    <section className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-heading text-base font-medium text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <CreatePlanPriceDialog planId={planId} />
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t("columns.billingCycle")}</TableHead>
                <TableHead>{t("columns.amount")}</TableHead>
                <TableHead>{t("columns.effectivePeriod")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((price, index) => (
                <TableRow key={price.id}>
                  <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                  <TableCell>{price.billingCycle}</TableCell>
                  <TableCell>{formatCurrency(price.amount, price.currencyCode)}</TableCell>
                  <TableCell>
                    {formatDate(price.effectiveFrom)} – {price.effectiveTo ? formatDate(price.effectiveTo) : t("ongoing")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={price.isActive ? "text-success" : "text-muted-foreground"}>
                      {price.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={tCommon("actions")}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_PRICING_UPDATE}>
                          <DropdownMenuItem onSelect={() => setActiveAction({ type: "edit", price })}>
                            {tCommon("update")}
                          </DropdownMenuItem>
                        </PlatformPermissionGate>
                        <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_PRICING_STATUS}>
                          {price.isActive ? (
                            <DropdownMenuItem onSelect={() => setActiveAction({ type: "deactivate", price })}>
                              {t("actions.deactivate")}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => setActiveAction({ type: "activate", price })}>
                              {t("actions.activate")}
                            </DropdownMenuItem>
                          )}
                        </PlatformPermissionGate>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {activeAction?.type === "edit" && (
        <EditPlanPriceDialog
          planId={planId}
          price={activeAction.price}
          open
          onOpenChange={(open) => !open && setActiveAction(null)}
        />
      )}

      <ActionConfirmDialog
        open={activeAction?.type === "activate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.activateTitle")}
        description={t("actions.activateDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isActivating}
        onConfirm={handleActivate}
      />

      <ActionConfirmDialog
        open={activeAction?.type === "deactivate"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.deactivateTitle")}
        description={t("actions.deactivateDescription")}
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        isLoading={isDeactivating}
        onConfirm={handleDeactivate}
      />
    </section>
  );
}
