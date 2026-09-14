"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useForgotPasswordMutation } from "@/features/auth/api/auth.api";
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/forgot-password.schema";
import { normalizeApiError } from "@/lib/api-error";

/**
 * Backend intentionally returns the exact same `{success,message}` shape
 * whether or not the email is registered (no enumeration) — so the only
 * genuine "error" states here are transport-level (network/429/500), never
 * "email not found." The success screen always shows the backend's own
 * generic message, never a locally-invented one, so there's a single
 * source of truth for that anti-enumeration wording.
 */
export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createForgotPasswordSchema({
        emailRequired: t("emailRequired"),
        emailInvalid: t("emailInvalid"),
      }),
    [t],
  );

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null);

    const result = await forgotPassword({ email: values.email.trim().toLowerCase() });

    if ("error" in result) {
      const normalized = normalizeApiError(result.error);
      setFormError(mapForgotPasswordError(normalized.status, t));
      return;
    }

    setSubmittedMessage(result.data.message);
  }

  if (submittedMessage) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <MailCheck className="size-6" aria-hidden="true" />
        </div>
        <p className="text-sm text-card-foreground">{submittedMessage}</p>
        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={() => setSubmittedMessage(null)}>
            {t("forgotPasswordAnotherEmail")}
          </Button>
          <Link href="/login" className="block text-sm text-primary hover:underline">
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
              {t("forgotPasswordSubmitting")}
            </>
          ) : (
            t("forgotPasswordSubmit")
          )}
        </Button>

        <Link href="/login" className="block text-center text-sm text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      </form>
    </Form>
  );
}

function mapForgotPasswordError(
  status: number | string,
  t: ReturnType<typeof useTranslations>,
): string {
  if (status === "FETCH_ERROR") return t("networkError");
  if (status === 429) return t("tooManyAttempts");
  return t("unexpectedError");
}
