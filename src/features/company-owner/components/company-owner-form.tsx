"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
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
  createCompanyOwnerSchema,
  type CompanyOwnerFormValues,
} from "@/features/company-owner/schemas/company-owner.schema";

interface CompanyOwnerFormProps {
  defaultValues: CompanyOwnerFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  /** Create-এ password required (`CreateCompanyOwnerDto`), edit-এ password field-ই নেই (verified)। */
  showPassword: boolean;
  onCancel: () => void;
  onSubmit: (values: CompanyOwnerFormValues) => void;
}

/** Industry/Tenant/Company-এর established RHF+Zod+shadcn `Form` pattern reuse। */
export function CompanyOwnerForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  cancelLabel,
  showPassword,
  onCancel,
  onSubmit,
}: CompanyOwnerFormProps) {
  const t = useTranslations("companyOwners");

  const schema = createCompanyOwnerSchema(
    {
      emailRequired: t("form.emailRequired"),
      emailInvalid: t("form.emailInvalid"),
      fullNameRequired: t("form.fullNameRequired"),
      fullNameLength: t("form.fullNameLength"),
      phoneLength: t("form.phoneLength"),
      passwordRequired: t("form.passwordRequired"),
      passwordLength: t("form.passwordLength"),
      passwordPattern: t("form.passwordPattern"),
      designationLength: t("form.designationLength"),
    },
    showPassword,
  );

  const form = useForm<CompanyOwnerFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.email")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder={t("form.emailPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.fullName")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.fullNamePlaceholder")} />
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

        {showPassword && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.password")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder={t("form.passwordPlaceholder")} />
                </FormControl>
                <FormDescription>{t("form.passwordDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.designation")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.designationPlaceholder")} />
              </FormControl>
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
