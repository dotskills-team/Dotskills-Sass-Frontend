"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useAppDispatch } from "@/store/hooks";
import { sessionRestored } from "@/store/slices/auth.slice";
import { useLoginMutation } from "@/features/auth/api/auth.api";
import { PasswordField } from "@/features/auth/components/password-field";
import { createLoginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema";
import { dashboardPathForScope, resolveUserScope } from "@/features/auth/lib/scope";
import { normalizeApiError } from "@/lib/api-error";

export function LoginForm() {
  const t = useTranslations("auth");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createLoginSchema({
        emailRequired: t("emailRequired"),
        emailInvalid: t("emailInvalid"),
        passwordRequired: t("passwordRequired"),
      }),
    [t],
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", loginType: "company" },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    const result = await login(values);

    if ("error" in result) {
      const normalized = normalizeApiError(result.error);
      setFormError(
        normalized.status === 401 ? t("invalidCredentials") : mapUnexpectedError(normalized.status, t),
      );
      return;
    }

    const { accessToken, user } = result.data;

    if (!user) {
      setFormError(t("unexpectedError"));
      return;
    }

    dispatch(sessionRestored({ accessToken, user }));

    const redirectTo = searchParams.get("redirectTo");
    router.push(redirectTo || dashboardPathForScope(resolveUserScope(user)));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="loginType"
          render={({ field }) => (
            <FormItem>
              <Tabs value={field.value} onValueChange={field.onChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="company" className="flex-1">
                    {t("loginTypeCompany")}
                  </TabsTrigger>
                  <TabsTrigger value="staff" className="flex-1">
                    {t("loginTypeStaff")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PasswordField
          control={form.control}
          name="password"
          label={t("password")}
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
        />

        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t("loggingIn")}
            </>
          ) : (
            t("login")
          )}
        </Button>
      </form>
    </Form>
  );
}

function mapUnexpectedError(
  status: number | string,
  t: ReturnType<typeof useTranslations>,
): string {
  if (status === "FETCH_ERROR") return t("networkError");
  if (status === 429) return t("tooManyAttempts");
  return t("unexpectedError");
}
