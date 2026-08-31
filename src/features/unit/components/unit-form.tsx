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

import { createUnitSchema, type UnitFormValues } from "@/features/unit/schemas/unit.schema";
import type { Unit } from "@/types/unit";

interface UnitFormProps {
  defaultValues: UnitFormValues;
  /** Other units this one could point to as its base — excludes itself when editing. */
  candidateBaseUnits: Unit[];
  isCodeEditable: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: UnitFormValues) => void;
}

const NONE_VALUE = "__none__";

/** Shared RHF body for create+edit, mirroring IndustryForm's established shape exactly. */
export function UnitForm({
  defaultValues,
  candidateBaseUnits,
  isCodeEditable,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: UnitFormProps) {
  const t = useTranslations("units");

  const schema = createUnitSchema({
    nameRequired: t("form.nameRequired"),
    nameLength: t("form.nameLength"),
    codeRequired: t("form.codeRequired"),
    codeLength: t("form.codeLength"),
    conversionFactorPositive: t("form.conversionFactorPositive"),
  });

  const form = useForm<UnitFormValues>({
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
                <Input
                  {...field}
                  placeholder={t("form.codePlaceholder")}
                  disabled={!isCodeEditable}
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                />
              </FormControl>
              {!isCodeEditable && <FormDescription>{t("form.codeDescription")}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="baseUnitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.baseUnit")}</FormLabel>
              <Select
                value={field.value || NONE_VALUE}
                onValueChange={(value) => field.onChange(value === NONE_VALUE ? "" : value)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.baseUnitPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>{t("form.baseUnitNone")}</SelectItem>
                  {candidateBaseUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t("form.baseUnitDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conversionFactor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.conversionFactor")}</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.0001" min="0" placeholder={t("form.conversionFactorPlaceholder")} />
              </FormControl>
              <FormDescription>{t("form.conversionFactorDescription")}</FormDescription>
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
