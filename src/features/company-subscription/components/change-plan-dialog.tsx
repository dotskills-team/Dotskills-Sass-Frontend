"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters/currency";
import { normalizeApiError } from "@/lib/api-error";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import {
  useCheckoutSubscriptionMutation,
  useListEligiblePlansQuery,
} from "@/features/company-subscription/api/company-subscription.api";
import { useCreateCompanyPaymentMutation } from "@/features/company-payment/api/company-payment.api";
import type { CompanySubscriptionBase } from "@/types/company-subscription";
import type { BillingCycle } from "@/types/platform";

interface SelectedPrice {
  planId: string;
  billingCycle: BillingCycle;
}

/**
 * Plan catalog সরাসরি `GET /subscriptions/plans`-এর server-filtered response থেকেই আসে —
 * backend ইতিমধ্যে ACTIVE+isPublic plan এবং company-এর নিজস্ব currency-তে eligible price-এ
 * scope করে দেয় (verified), তাই এখানে কোনো client-side eligibility filtering নেই।
 */
export function ChangePlanDialog({ subscription }: { subscription: CompanySubscriptionBase }) {
  const t = useTranslations("companySubscription");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedPrice | null>(null);

  const { data: plans, isLoading, error, refetch } = useListEligiblePlansQuery(undefined, { skip: !open });
  const [checkoutSubscription, { isLoading: isCheckingOut }] = useCheckoutSubscriptionMutation();
  const [createPayment, { isLoading: isInitiatingPayment }] = useCreateCompanyPaymentMutation();
  const isSubmitting = isCheckingOut || isInitiatingPayment;

  const isCurrentSelection =
    selected?.planId === subscription.planId && selected.billingCycle === subscription.billingCycle;

  /**
   * Plan change always goes through payment now — no instant mutation. Checkout
   * generates/reuses the Invoice for the new plan, then this hands straight into the
   * same `PayInvoiceDialog` flow uses: full navigate to the gateway's hosted page. The
   * new plan only takes effect once the backend confirms payment (never here).
   */
  async function handleConfirm() {
    if (!selected || isCurrentSelection) return;

    const checkoutResult = await checkoutSubscription({ id: subscription.id, ...selected });

    if ("error" in checkoutResult) {
      toast.error(normalizeApiError(checkoutResult.error).message);
      return;
    }

    const paymentResult = await createPayment({ invoiceId: checkoutResult.data.invoice.id });

    if ("error" in paymentResult) {
      toast.error(normalizeApiError(paymentResult.error).message);
      return;
    }

    window.location.href = paymentResult.data.gatewayPageUrl;
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setSelected(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUBSCRIPTION_CHANGE_PLAN}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RefreshCw aria-hidden="true" />
            {t("changePlan.trigger")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("changePlan.title")}</DialogTitle>
          <DialogDescription>{t("changePlan.description")}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !plans || plans.length === 0 ? (
          <EmptyState title={t("changePlan.empty")} />
        ) : (
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{plan.name}</p>
                    {plan.description && <p className="text-xs text-muted-foreground">{plan.description}</p>}
                  </div>
                  {plan.id === subscription.planId && (
                    <Badge variant="outline">{t("changePlan.currentPlan")}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {plan.prices.map((price) => {
                    const isSelected =
                      selected?.planId === plan.id && selected.billingCycle === price.billingCycle;
                    const isCurrent =
                      plan.id === subscription.planId && price.billingCycle === subscription.billingCycle;

                    return (
                      <button
                        key={price.id}
                        type="button"
                        onClick={() => setSelected({ planId: plan.id, billingCycle: price.billingCycle })}
                        className={cn(
                          "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-foreground hover:bg-muted/50",
                        )}
                      >
                        {isSelected && <Check className="size-4" aria-hidden="true" />}
                        <span>{price.billingCycle}</span>
                        <span className="font-semibold">{formatCurrency(price.amount, price.currencyCode)}</span>
                        {isCurrent && (
                          <span className="text-xs text-muted-foreground">({t("changePlan.currentPrice")})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={!selected || isCurrentSelection || isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("changePlan.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
