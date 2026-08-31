"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

import { createLocationSchema, type LocationFormValues } from "@/features/location/schemas/location.schema";

interface LocationFormProps {
  defaultValues: LocationFormValues;
  isTypeEditable: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: LocationFormValues) => void;
}

export function LocationForm({
  defaultValues,
  isTypeEditable,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: LocationFormProps) {
  const t = useTranslations("locations");

  const schema = createLocationSchema({
    nameRequired: t("form.nameRequired"),
    nameLength: t("form.nameLength"),
    locationTypeRequired: t("form.locationTypeRequired"),
  });

  const form = useForm<LocationFormValues>({
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
          name="locationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.locationType")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={!isTypeEditable}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.locationTypePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BRANCH">{t("type.BRANCH")}</SelectItem>
                  <SelectItem value="WAREHOUSE">{t("type.WAREHOUSE")}</SelectItem>
                </SelectContent>
              </Select>
              {!isTypeEditable && <FormDescription>{t("form.locationTypeDescription")}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.address")}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={t("form.addressPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isSalesEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">{t("form.isSalesEnabled")}</FormLabel>
                <FormDescription>{t("form.isSalesEnabledDescription")}</FormDescription>
              </div>
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
