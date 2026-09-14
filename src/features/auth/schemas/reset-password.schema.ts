import { z } from "zod";

/**
 * Mirrors `ResetPasswordDto` exactly — `@MinLength(12) @MaxLength(128)` on
 * `password`, `@Match('password')` on `passwordConfirmation` — no stronger
 * or different client-side rule is invented (Section 3's explicit rule).
 */
export function createResetPasswordSchema(messages: {
  passwordRequired: string;
  passwordTooShort: string;
  passwordTooLong: string;
  confirmationRequired: string;
  passwordMismatch: string;
}) {
  return z
    .object({
      password: z
        .string({ error: messages.passwordRequired })
        .min(12, { error: messages.passwordTooShort })
        .max(128, { error: messages.passwordTooLong }),
      passwordConfirmation: z
        .string({ error: messages.confirmationRequired })
        .min(1, { error: messages.confirmationRequired }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      error: messages.passwordMismatch,
      path: ["passwordConfirmation"],
    });
}

export type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;
