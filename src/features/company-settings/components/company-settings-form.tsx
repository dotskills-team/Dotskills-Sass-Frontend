"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

import {
  createCompanySettingsSchema,
  type CompanySettingsFormValues,
} from "@/features/company-settings/schemas/company-settings.schema";

interface CompanySettingsFormProps {
  defaultValues: CompanySettingsFormValues;
  isSubmitting: boolean;
  onSubmit: (values: CompanySettingsFormValues) => void;
}

const TOGGLE_KEYS = [
  "enableMultiUnit",
  "enableCustomerDue",
  "enableBarcode",
  "enableProductVariant",
  "enableComboOffer",
  "enableMultiLocation",
  "allowNegativeStock",
  "enableTax",
] as const;

export function CompanySettingsForm({ defaultValues, isSubmitting, onSubmit }: CompanySettingsFormProps) {
  const t = useTranslations("settings");

  const schema = createCompanySettingsSchema({
    maxCustomerDueLimitNonNegative: t("fields.maxCustomerDueLimitNonNegative"),
    maxSupplierPayableLimitNonNegative: t("fields.maxSupplierPayableLimitNonNegative"),
    defaultTaxRateNonNegative: t("fields.defaultTaxRateNonNegative"),
  });

  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const enableCustomerDue = useWatch({ control: form.control, name: "enableCustomerDue" });
  const enableTax = useWatch({ control: form.control, name: "enableTax" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {TOGGLE_KEYS.map((key) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 space-y-0 rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">{t(`toggles.${key}`)}</FormLabel>
                      <FormDescription>{t(`toggles.${key}Help`)}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}

            {enableCustomerDue && (
              <FormField
                control={form.control}
                name="maxCustomerDueLimit"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-border p-4">
                    <FormLabel>{t("fields.maxCustomerDueLimit")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" placeholder={t("fields.maxCustomerDueLimitPlaceholder")} />
                    </FormControl>
                    <FormDescription>{t("fields.maxCustomerDueLimitHelp")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="maxSupplierPayableLimit"
              render={({ field }) => (
                <FormItem className="rounded-lg border border-border p-4">
                  <FormLabel>{t("fields.maxSupplierPayableLimit")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0" placeholder={t("fields.maxSupplierPayableLimitPlaceholder")} />
                  </FormControl>
                  <FormDescription>{t("fields.maxSupplierPayableLimitHelp")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {enableTax && (
              <FormField
                control={form.control}
                name="defaultTaxRate"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-border p-4">
                    <FormLabel>{t("fields.defaultTaxRate")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.001" min="0" placeholder={t("fields.defaultTaxRatePlaceholder")} />
                    </FormControl>
                    <FormDescription>{t("fields.defaultTaxRateHelp")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SETTINGS_UPDATE}>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {t("save")}
            </Button>
          </div>
        </CompanyPermissionGate>
      </form>
    </Form>
  );
}
