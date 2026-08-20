"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import { useListSubscriptionsQuery } from "@/features/subscription/api/subscription.api";
import { useCreateBillingMutation } from "@/features/billing/api/billing.api";

/** `CreateBillingDto`-তে subscriptionId/periodStart/periodEnd/dueAt ছাড়া কিছু নেই — amount/currency backend `subscription.priceSnapshot` থেকে derive করে, এখানে কোনো amount input নেই (verified)। */
export function CreateBillingDialog() {
  const t = useTranslations("billing");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [dueAt, setDueAt] = useState("");

  const { data: subscriptions } = useListSubscriptionsQuery();
  const [createBilling, { isLoading }] = useCreateBillingMutation();

  const isValid = subscriptionId && periodStart && periodEnd && dueAt;

  async function handleSubmit() {
    if (!isValid) return;

    const result = await createBilling({ subscriptionId, periodStart, periodEnd, dueAt });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    handleOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSubscriptionId("");
      setPeriodStart("");
      setPeriodEnd("");
      setDueAt("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.BILLING_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">
              {t("form.subscription")} <span className="text-destructive">*</span>
            </Label>
            <Select value={subscriptionId} onValueChange={setSubscriptionId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("form.subscriptionPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {(subscriptions?.items ?? []).map((subscription) => (
                  <SelectItem key={subscription.id} value={subscription.id}>
                    {subscription.plan?.name ?? subscription.id} — {subscription.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-2">
                {t("form.periodStart")} <span className="text-destructive">*</span>
              </Label>
              <Input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
            </div>
            <div>
              <Label className="mb-2">
                {t("form.periodEnd")} <span className="text-destructive">*</span>
              </Label>
              <Input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
            </div>
            <div>
              <Label className="mb-2">
                {t("form.dueAt")} <span className="text-destructive">*</span>
              </Label>
              <Input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tCommon("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
