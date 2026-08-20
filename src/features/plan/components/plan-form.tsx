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

import { createPlanSchema, type PlanFormValues } from "@/features/plan/schemas/plan.schema";

interface PlanFormProps {
  defaultValues: PlanFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: PlanFormValues) => void;
}

/** Industry-form pattern reuse — Plan module। */
export function PlanForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: PlanFormProps) {
  const t = useTranslations("plans");

  const schema = createPlanSchema({
    codeRequired: t("form.codeRequired"),
    codeLength: t("form.codeLength"),
    nameRequired: t("form.nameRequired"),
    nameLength: t("form.nameLength"),
    descriptionLength: t("form.descriptionLength"),
    trialDaysRange: t("form.trialDaysRange"),
  });

  const form = useForm<PlanFormValues>({
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

        <FormField
          control={form.control}
          name="trialDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.trialDays")}</FormLabel>
              <FormControl>
                <Input {...field} inputMode="numeric" placeholder={t("form.trialDaysPlaceholder")} />
              </FormControl>
              <FormDescription>{t("form.trialDaysDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.isPublic")}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t("form.isPublicTrue")}</SelectItem>
                    <SelectItem value="false">{t("form.isPublicFalse")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>{t("form.isPublicDescription")}</FormDescription>
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
