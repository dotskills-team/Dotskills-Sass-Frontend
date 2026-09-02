"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useCreateStockAdjustmentMutation } from "@/features/stock-adjustment/api/stock-adjustment.api";
import { ProductSearchSelect } from "@/features/stock-adjustment/components/product-search-select";
import {
  createBulkStockAdjustmentSchema,
  type BulkStockAdjustmentFormValues,
} from "@/features/stock-adjustment/schemas/bulk-stock-adjustment.schema";
import { toBulkStockAdjustmentPayload } from "@/features/stock-adjustment/lib/stock-adjustment-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import { resolveBusinessErrorMessage } from "@/lib/business-error-messages";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { StockAdjustmentLineResult, StockAdjustmentReason } from "@/types/stock-adjustment";

const REASONS: StockAdjustmentReason[] = [
  "COUNT_MISMATCH",
  "DAMAGE",
  "THEFT_SHRINKAGE",
  "EXPIRED",
  "OPENING_STOCK",
  "OTHER",
];

const EMPTY_LINE = {
  productId: "",
  locationId: "",
  mode: "newQuantity" as const,
  newQuantity: "",
  changeQuantity: "",
  reason: "COUNT_MISMATCH",
  note: "",
};

/**
 * Full page, not a Dialog — a variable-length line list needs real
 * vertical space (same reasoning already established for Purchase Order/
 * POS's `useFieldArray` forms). Each line commits independently on the
 * backend (see the plan's Q2 answer), so submitting shows a per-line
 * result inline rather than a single pass/fail toast — partial success is
 * the expected normal outcome here, not an edge case to hide.
 */
export default function NewStockAdjustmentPage() {
  const t = useTranslations("stockAdjustments");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const [createStockAdjustment, { isLoading }] = useCreateStockAdjustmentMutation();
  const [lineResults, setLineResults] = useState<StockAdjustmentLineResult[] | null>(null);

  const schema = createBulkStockAdjustmentSchema({
    productRequired: t("form.productPlaceholder"),
    locationRequired: t("form.locationPlaceholder"),
    quantityRequired: t("form.newQuantityPlaceholder"),
    reasonRequired: t("form.reasonPlaceholder"),
    noteRequiredForOther: t("form.noteRequiredError"),
    itemsMinOne: t("form.productPlaceholder"),
  });

  const form = useForm<BulkStockAdjustmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { items: [EMPTY_LINE] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const items = useWatch({ control: form.control, name: "items" });

  async function handleSubmit(values: BulkStockAdjustmentFormValues) {
    if (!companyId) return;
    const result = await createStockAdjustment({
      companyId,
      items: toBulkStockAdjustmentPayload(values.items),
    });

    if ("error" in result) {
      toast.error(resolveBusinessErrorMessage(normalizeApiError(result.error).message, locale));
      return;
    }

    setLineResults(result.data.lines);
    const { appliedCount, errorCount } = result.data.summary;
    if (errorCount === 0) {
      toast.success(t("result.success"));
    } else if (appliedCount === 0) {
      toast.error(t("result.allFailed"));
    } else {
      toast.warning(t("result.partialSuccess", { appliedCount, total: appliedCount + errorCount }));
    }
  }

  if (!companyId || !locations) {
    return (
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.STOCK_ADJUSTMENT_CREATE} fallback={<PermissionDenied />}>
        <PageHeader title={t("newAdjustment")} description={t("description")} />
        <div className="mx-auto max-w-4xl p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </CompanyPermissionGate>
    );
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.STOCK_ADJUSTMENT_CREATE} fallback={<PermissionDenied />}>
      <PageHeader title={t("newAdjustment")} description={t("description")} />

      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            {fields.map((field, index) => {
              const lineResult = lineResults?.[index];
              const line = items?.[index];
              return (
                <Card key={field.id}>
                  <CardContent className="space-y-3 pt-6">
                    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[2fr_1.5fr_auto]">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>{t("form.product")}</FormLabel>
                            <FormControl>
                              <ProductSearchSelect
                                companyId={companyId}
                                value={itemField.value}
                                onChange={(product) => itemField.onChange(product.id)}
                                placeholder={t("form.productPlaceholder")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.locationId`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>{t("form.location")}</FormLabel>
                            <Select value={itemField.value} onValueChange={itemField.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={t("form.locationPlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="mt-6"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                        aria-label={t("form.removeLine")}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.mode`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>{t("mode.label")}</FormLabel>
                            <Select value={itemField.value} onValueChange={itemField.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="newQuantity">{t("mode.newQuantity")}</SelectItem>
                                <SelectItem value="changeQuantity">{t("mode.changeQuantity")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      {line?.mode === "changeQuantity" ? (
                        <FormField
                          control={form.control}
                          name={`items.${index}.changeQuantity`}
                          render={({ field: itemField }) => (
                            <FormItem>
                              <FormLabel>{t("form.changeQuantity")}</FormLabel>
                              <FormControl>
                                <Input {...itemField} type="number" step="0.0001" placeholder={t("form.changeQuantityPlaceholder")} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name={`items.${index}.newQuantity`}
                          render={({ field: itemField }) => (
                            <FormItem>
                              <FormLabel>{t("form.newQuantity")}</FormLabel>
                              <FormControl>
                                <Input {...itemField} type="number" step="0.0001" min="0" placeholder={t("form.newQuantityPlaceholder")} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name={`items.${index}.reason`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>{t("form.reason")}</FormLabel>
                            <Select value={itemField.value} onValueChange={itemField.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={t("form.reasonPlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {REASONS.map((reasonOption) => (
                                  <SelectItem key={reasonOption} value={reasonOption}>
                                    {t(`reason.${reasonOption}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`items.${index}.note`}
                      render={({ field: itemField }) => (
                        <FormItem>
                          <FormLabel>
                            {line?.reason === "OTHER" ? t("form.noteRequired") : t("form.noteRecommended")}
                          </FormLabel>
                          <FormControl>
                            <Textarea {...itemField} placeholder={t("form.notePlaceholder")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {lineResult && (
                      <div className="flex items-center gap-2 border-t border-border pt-3 text-sm">
                        {lineResult.status === "APPLIED" ? (
                          <>
                            <Badge variant="outline" className="border-success/30 bg-success/15 text-success">
                              {t("result.applied")}
                            </Badge>
                            <span className="tabular-nums text-muted-foreground">
                              {t("result.beforeAfter", {
                                before: Number(lineResult.beforeQuantity).toLocaleString(),
                                after: Number(lineResult.afterQuantity).toLocaleString(),
                              })}
                            </span>
                          </>
                        ) : (
                          <>
                            <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                              {t("result.error")}
                            </Badge>
                            <span className="text-muted-foreground">
                              {resolveBusinessErrorMessage(lineResult.errorMessage ?? "", locale)}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            <Button type="button" variant="outline" onClick={() => append(EMPTY_LINE)}>
              <Plus aria-hidden="true" />
              {t("form.addLine")}
            </Button>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/company/stock-adjustments")} disabled={isLoading}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {t("form.submitBulk", { count: fields.length })}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </CompanyPermissionGate>
  );
}
