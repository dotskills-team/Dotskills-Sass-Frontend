"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useUpdateNameMutation } from "@/features/user-profile/api/user-profile.api";
import {
  createChangeNameSchema,
  type ChangeNameFormValues,
} from "@/features/user-profile/schemas/change-name.schema";
import { normalizeApiError } from "@/lib/api-error";

export function ChangeNameForm({ fullName }: { fullName: string }) {
  const t = useTranslations("userProfile");
  const [updateName, { isLoading }] = useUpdateNameMutation();

  const schema = createChangeNameSchema({
    nameRequired: t("name.nameRequired"),
    nameLength: t("name.nameLength"),
  });

  const form = useForm<ChangeNameFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName },
  });

  // Server-refetched fullName (after a successful save, or a fresh page load) always wins.
  useEffect(() => {
    form.reset({ fullName });
  }, [fullName, form]);

  async function onSubmit(values: ChangeNameFormValues) {
    const result = await updateName({ fullName: values.fullName.trim() });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("name.success"));
  }

  const currentName = useWatch({ control: form.control, name: "fullName" });
  const isUnchanged = currentName.trim() === fullName.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("name.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row sm:items-end" noValidate>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("name.label")}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading || isUnchanged}>
              {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {t("name.submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
