"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "@/components/ui/form";

import { PasswordField } from "@/features/auth/components/password-field";
import {
  useResetPasswordMutation,
  useValidateResetTokenQuery,
} from "@/features/auth/api/auth.api";
import {
  createResetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/reset-password.schema";
import { normalizeApiError } from "@/lib/api-error";

/**
 * Reset link format is fixed by the backend's own email template
 * (`passwordResetEmailHtml` → `${FRONTEND_URL}/reset-password?token=...&email=...`,
 * verified in `dotskills-sass-backend`) — query params, not a path segment,
 * so this page must read `token`/`email` from the URL's search params.
 */
export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSucceeded, setResetSucceeded] = useState(false);

  const {
    data: validation,
    isLoading: isValidating,
    isError: validationFailed,
  } = useValidateResetTokenQuery(token ?? "", { skip: !token });

  const schema = useMemo(
    () =>
      createResetPasswordSchema({
        passwordRequired: t("passwordRequired"),
        passwordTooShort: t("passwordTooShort"),
        passwordTooLong: t("passwordTooLong"),
        confirmationRequired: t("confirmationRequired"),
        passwordMismatch: t("passwordMismatch"),
      }),
    [t],
  );

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", passwordConfirmation: "" },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token || !email) return;
    setFormError(null);

    const result = await resetPassword({
      email,
      token,
      password: values.password,
      passwordConfirmation: values.passwordConfirmation,
    });

    if ("error" in result) {
      const normalized = normalizeApiError(result.error);
      setFormError(mapResetPasswordError(normalized.status, t));
      return;
    }

    setResetSucceeded(true);
  }

  if (!token || !email) {
    return (
      <InvalidLinkState
        title={t("invalidLinkTitle")}
        description={t("invalidLinkDescription")}
        requestNewLinkLabel={t("requestNewLink")}
      />
    );
  }

  if (isValidating) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        <span className="sr-only">{t("checkingLink")}</span>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (validationFailed || (validation && !validation.valid)) {
    return (
      <InvalidLinkState
        title={t("tokenInvalidTitle")}
        description={t("tokenInvalidDescription")}
        requestNewLinkLabel={t("requestNewLink")}
      />
    );
  }

  if (resetSucceeded) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold text-card-foreground">{t("resetSuccessTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("resetSuccessDescription")}</p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">{t("continueToLogin")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <PasswordField
          control={form.control}
          name="password"
          label={t("newPassword")}
          placeholder={t("newPasswordPlaceholder")}
          autoComplete="new-password"
        />
        <p className="-mt-3 text-xs text-muted-foreground">{t("passwordRequirementHint")}</p>

        <PasswordField
          control={form.control}
          name="passwordConfirmation"
          label={t("confirmPassword")}
          placeholder={t("confirmPasswordPlaceholder")}
          autoComplete="new-password"
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
              {t("resetPasswordSubmitting")}
            </>
          ) : (
            t("resetPasswordSubmit")
          )}
        </Button>
      </form>
    </Form>
  );
}

function InvalidLinkState({
  title,
  description,
  requestNewLinkLabel,
}: {
  title: string;
  description: string;
  requestNewLinkLabel: string;
}) {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild className="w-full">
        <Link href="/forgot-password">{requestNewLinkLabel}</Link>
      </Button>
    </div>
  );
}

function mapResetPasswordError(
  status: number | string,
  t: ReturnType<typeof useTranslations>,
): string {
  if (status === "FETCH_ERROR") return t("networkError");
  if (status === 429) return t("tooManyAttempts");
  if (status === 400) return t("tokenInvalidDescription");
  return t("unexpectedError");
}
