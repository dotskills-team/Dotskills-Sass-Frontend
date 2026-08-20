"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

import { createIndustrySchema, type IndustryFormValues } from "@/features/industry/schemas/industry.schema";

interface IndustryFormProps {
  defaultValues: IndustryFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: IndustryFormValues) => void;
}

/**
 * Reusable form body — Create ও Edit dialog দুটোই এই একই component
 * ব্যবহার করে, শুধু `defaultValues`/`onSubmit`/label ভিন্ন। Plan/Company/
 * Tenant form বানানোর সময় এই একই RHF+Zod+shadcn `Form` shape (যেটা
 * `login-form.tsx`-এ প্রথম established হয়েছিল) অনুসরণ করা যাবে —
 * copy-paste architecture নয়, প্রমাণিত pattern reuse।
 */
export function IndustryForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: IndustryFormProps) {
  const t = useTranslations("industries");

  const schema = createIndustrySchema({
    codeRequired: t("form.codeRequired"),
    codeLength: t("form.codeLength"),
    codePattern: t("form.codePattern"),
    nameRequired: t("form.nameRequired"),
    nameLength: t("form.nameLength"),
    descriptionLength: t("form.descriptionLength"),
  });

  const form = useForm<IndustryFormValues>({
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
                  placeholder={t("form.codePlaceholder")}
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>{t("form.codeDescription")}</FormDescription>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.description")}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={t("form.descriptionPlaceholder")} />
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
