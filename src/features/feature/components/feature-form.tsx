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

import { createFeatureSchema, type FeatureFormValues } from "@/features/feature/schemas/feature.schema";

interface FeatureFormProps {
  defaultValues: FeatureFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: FeatureFormValues) => void;
}

/** Industry-form pattern reuse — Feature module। */
export function FeatureForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: FeatureFormProps) {
  const t = useTranslations("features");

  const schema = createFeatureSchema({
    nameRequired: t("form.nameRequired"),
    nameLength: t("form.nameLength"),
    codeRequired: t("form.codeRequired"),
    codeLength: t("form.codeLength"),
    moduleRequired: t("form.moduleRequired"),
    moduleLength: t("form.moduleLength"),
    descriptionLength: t("form.descriptionLength"),
  });

  const form = useForm<FeatureFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.code")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.codePlaceholder")} />
              </FormControl>
              <FormDescription>{t("form.codeDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="module"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.module")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.modulePlaceholder")} />
              </FormControl>
              <FormDescription>{t("form.moduleDescription")}</FormDescription>
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
