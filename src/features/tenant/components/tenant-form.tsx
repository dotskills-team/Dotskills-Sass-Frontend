"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { createTenantSchema, type TenantFormValues } from "@/features/tenant/schemas/tenant.schema";

interface TenantFormProps {
  defaultValues: TenantFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onSubmit: (values: TenantFormValues) => void;
}

/**
 * Industry-এর established RHF+Zod+shadcn `Form` pattern reuse — Create ও Edit দুটোই এই
 * একই component ব্যবহার করে। `code`/`slug` কোনো input field নেই — backend সবসময় `name`
 * থেকে system-generate করে, user কখনো সেট/edit করতে পারে না।
 */
export function TenantForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: TenantFormProps) {
  const t = useTranslations("tenants");

  const schema = createTenantSchema({
    nameRequired: t("form.nameRequired"),
    nameLength: t("form.nameLength"),
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
