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

import { createTenantSchema, type TenantFormValues } from "@/features/tenant/schemas/tenant.schema";

interface TenantFormProps {
  defaultValues: TenantFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  /** Edit-এ `UpdateTenantDto` code field সমর্থন করে না (verified) — তাই code input disable থাকে। */
  codeReadOnly?: boolean;
  onCancel: () => void;
  onSubmit: (values: TenantFormValues) => void;
}

/** Industry-এর established RHF+Zod+shadcn `Form` pattern reuse — Create ও Edit দুটোই এই একই component ব্যবহার করে। */
export function TenantForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  cancelLabel,
  codeReadOnly,
  onCancel,
  onSubmit,
}: TenantFormProps) {
  const t = useTranslations("tenants");

  const schema = createTenantSchema({
    codeRequired: t("form.codeRequired"),
    codeLength: t("form.codeLength"),
    codePattern: t("form.codePattern"),
    nameRequired: t("form.nameRequired"),
    nameLength: t("form.nameLength"),
    slugRequired: t("form.slugRequired"),
    slugLength: t("form.slugLength"),
    slugPattern: t("form.slugPattern"),
  });

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.name")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.namePlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.slug")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("form.slugPlaceholder")}
                  onChange={(event) => field.onChange(event.target.value.toLowerCase())}
                />
              </FormControl>
              <FormDescription>{t("form.slugDescription")}</FormDescription>
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
