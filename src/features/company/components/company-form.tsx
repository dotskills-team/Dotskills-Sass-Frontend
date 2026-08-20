"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { createCompanySchema, type CompanyFormValues } from "@/features/company/schemas/company.schema";
import { useListTenantsQuery } from "@/features/tenant/api/tenant.api";
import { useListIndustriesQuery } from "@/features/industry/api/industry.api";

interface CompanyFormProps {
  defaultValues: CompanyFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  /** Edit-এ `UpdateCompanyDto` tenantId/code সমর্থন করে না (verified) — তাই disable থাকে। */
  tenantReadOnly?: boolean;
  codeReadOnly?: boolean;
  onCancel: () => void;
  onSubmit: (values: CompanyFormValues) => void;
}

/** Industry/Tenant-এর established RHF+Zod+shadcn `Form` pattern reuse। */
export function CompanyForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  cancelLabel,
  tenantReadOnly,
  codeReadOnly,
  onCancel,
  onSubmit,
}: CompanyFormProps) {
  const t = useTranslations("companies");

  const { data: tenants } = useListTenantsQuery({ limit: 100 });
  const { data: industries } = useListIndustriesQuery({ limit: 100 });
  const availableIndustries = (industries?.items ?? []).filter((i) => i.status !== "ARCHIVED");

  const schema = createCompanySchema({
    tenantRequired: t("form.tenantRequired"),
    industryRequired: t("form.industryRequired"),
    codeRequired: t("form.codeRequired"),
    codeLength: t("form.codeLength"),
    codePattern: t("form.codePattern"),
    legalNameRequired: t("form.legalNameRequired"),
    legalNameLength: t("form.legalNameLength"),
    tradeNameLength: t("form.tradeNameLength"),
    emailInvalid: t("form.emailInvalid"),
    phoneLength: t("form.phoneLength"),
    taxIdLength: t("form.taxIdLength"),
    registrationNoLength: t("form.registrationNoLength"),
    currencyLength: t("form.currencyLength"),
    timezoneLength: t("form.timezoneLength"),
  });

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.tenant")} <span className="text-destructive">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={tenantReadOnly}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("form.tenantPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(tenants?.items ?? []).map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.industry")} <span className="text-destructive">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("form.industryPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableIndustries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.name}
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.code")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={codeReadOnly}
                  placeholder={t("form.codePlaceholder")}
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                {codeReadOnly ? t("form.codeImmutable") : t("form.codeDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="legalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.legalName")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.legalNamePlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tradeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.tradeName")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.tradeNamePlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.email")}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder={t("form.emailPlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.phone")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("form.phonePlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.taxId")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("form.taxIdPlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.registrationNo")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("form.registrationNoPlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="baseCurrencyCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.baseCurrencyCode")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("form.baseCurrencyCodePlaceholder")}
                    onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.timezone")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("form.timezonePlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
