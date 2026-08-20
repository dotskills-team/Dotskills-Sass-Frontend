"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  createPlanPriceCreateSchema,
  createPlanPriceEditSchema,
  type PlanPriceCreateFormValues,
  type PlanPriceEditFormValues,
} from "@/features/plan-price/schemas/plan-price.schema";

type PlanPriceFormValues = PlanPriceCreateFormValues | PlanPriceEditFormValues;

interface PlanPriceFormProps {
  mode: "create" | "edit";
  defaultValues: PlanPriceFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: PlanPriceFormValues) => void;
}

/**
 * Industry-form pattern reuse — PlanPrice module। `billingCycle`/
 * `currencyCode` শুধু create mode-এ দেখানো হয় (backend-এ immutable,
 * UpdatePlanPriceDto-তে নেই — verified)।
 */
export function PlanPriceForm({
  mode,
  defaultValues,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: PlanPriceFormProps) {
  const t = useTranslations("planPrices");

  const messages = {
    billingCycleRequired: t("form.billingCycleRequired"),
    currencyCodePattern: t("form.currencyCodePattern"),
    amountRequired: t("form.amountRequired"),
    amountInvalid: t("form.amountInvalid"),
    effectiveToBeforeFrom: t("form.effectiveToBeforeFrom"),
  };

  const schema = mode === "create" ? createPlanPriceCreateSchema(messages) : createPlanPriceEditSchema(messages);

  const form = useForm<PlanPriceFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {mode === "create" && (
          <>
            <FormField
              control={form.control}
              name="billingCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.billingCycle")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value as string} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("form.billingCyclePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">{t("form.billingCycleMonthly")}</SelectItem>
                        <SelectItem value="YEARLY">{t("form.billingCycleYearly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currencyCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.currencyCode")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("form.currencyCodePlaceholder")}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>{t("form.currencyCodeDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.amount")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} inputMode="decimal" placeholder={t("form.amountPlaceholder")} />
              </FormControl>
              <FormDescription>{t("form.amountDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="effectiveFrom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.effectiveFrom")}</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormDescription>{t("form.effectiveFromDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="effectiveTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.effectiveTo")}</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormDescription>{t("form.effectiveToDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.isActive")}</FormLabel>
              <FormControl>
                <Select value={field.value as string} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t("form.isActiveTrue")}</SelectItem>
                    <SelectItem value="false">{t("form.isActiveFalse")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>{t("form.isActiveDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
