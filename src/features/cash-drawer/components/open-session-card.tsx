"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAppSelector } from "@/store/hooks";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import {
  useListCashDrawerSessionsQuery,
  useOpenCashDrawerSessionMutation,
} from "@/features/cash-drawer/api/cash-drawer.api";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";

/**
 * openingBalance is only ever sent when no previous CLOSED session exists
 * for this cashier at the selected Location — otherwise the server would
 * ignore it anyway (see cash-drawer.service.ts), but showing the real
 * carried-forward amount *before* submission (not just accepting it
 * blindly) is the whole point of your requirement here.
 */
export function OpenSessionCard({ companyId }: { companyId: string }) {
  const t = useTranslations("cashDrawer");
  const locale = useLocale();
  const userId = useAppSelector((state) => state.auth.user?.userId);

  const { data: locations } = useListLocationsQuery(companyId, { skip: !companyId });
  const salesLocations = (locations ?? []).filter((location) => location.isSalesEnabled);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const locationId = selectedLocationId ?? "";

  const { data: carryForward } = useListCashDrawerSessionsQuery(
    { companyId, locationId, cashierId: userId, status: "CLOSED", page: 1, limit: 1 },
    { skip: !companyId || !locationId || !userId },
  );
  const carryForwardSession = carryForward?.items[0];

  const [openingBalanceInput, setOpeningBalanceInput] = useState("");
  const [openSession, { isLoading }] = useOpenCashDrawerSessionMutation();

  async function handleSubmit() {
    if (!locationId) return;

    if (!carryForwardSession && !openingBalanceInput) {
      toast.error(t("open.openingBalanceRequired"));
      return;
    }

    const result = await openSession({
      companyId,
      body: {
        locationId,
        ...(carryForwardSession ? {} : { openingBalance: Number(openingBalanceInput) }),
      },
    });

    if ("error" in result) {
      const message = normalizeApiError(result.error).message;
      toast.error(resolveBusinessErrorMessage(message, locale));
      return;
    }

    toast.success(t("open.success"));
    setOpeningBalanceInput("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("open.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs">
          <label className="mb-1 block text-sm font-medium">{t("open.location")}</label>
          <Select value={locationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("open.locationPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {salesLocations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {locationId &&
          (carryForwardSession ? (
            <div className="max-w-xs rounded-md border border-border bg-muted/50 p-3 text-sm text-foreground">
              {t("open.carriedForward", {
                amount: Number(carryForwardSession.actualClosingBalance).toLocaleString(),
              })}
            </div>
          ) : (
            <div className="max-w-xs">
              <label className="mb-1 block text-sm font-medium">{t("open.openingBalance")}</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={openingBalanceInput}
                onChange={(event) => setOpeningBalanceInput(event.target.value)}
                placeholder={t("open.openingBalancePlaceholder")}
              />
            </div>
          ))}

        <Button onClick={handleSubmit} disabled={!locationId || isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("open.submit")}
        </Button>
      </CardContent>
    </Card>
  );
}
