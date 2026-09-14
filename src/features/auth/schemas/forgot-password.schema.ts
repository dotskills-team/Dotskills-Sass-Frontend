import { z } from "zod";

/** Mirrors `ForgotPasswordDto` (`@IsEmail`) — backend stays authoritative, this is UX-only pre-validation, same convention as `login.schema.ts`. */
export function createForgotPasswordSchema(messages: {
  emailRequired: string;
  emailInvalid: string;
}) {
  return z.object({
    email: z
      .string({ error: messages.emailRequired })
      .min(1, { error: messages.emailRequired })
      .email({ error: messages.emailInvalid }),
  });
}

export type ForgotPasswordFormValues = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
