"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useChangePasswordMutation } from "@/features/user-profile/api/user-profile.api";
import {
  createChangePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/user-profile/schemas/change-password.schema";
import { normalizeApiError } from "@/lib/api-error";

export function ChangePasswordForm() {
  const t = useTranslations("userProfile");
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [incorrectCurrentPassword, setIncorrectCurrentPassword] = useState(false);

  const schema = createChangePasswordSchema({
    currentPasswordRequired: t("password.currentPasswordRequired"),
    newPasswordLength: t("password.newPasswordLength"),
    confirmPasswordMismatch: t("password.confirmPasswordMismatch"),
  });

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    setIncorrectCurrentPassword(false);
    const result = await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });

    if ("error" in result) {
      const normalized = normalizeApiError(result.error);
      if (normalized.status === 400) {
        setIncorrectCurrentPassword(true);
        form.setError("currentPassword", { message: t("password.incorrectCurrentPassword") });
        return;
      }
      toast.error(normalized.message);
      return;
    }

    toast.success(t("password.success"));
    form.reset({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("password.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
            onChange={() => incorrectCurrentPassword && setIncorrectCurrentPassword(false)}
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password.currentPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password.newPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password.confirmNewPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {t("password.submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
