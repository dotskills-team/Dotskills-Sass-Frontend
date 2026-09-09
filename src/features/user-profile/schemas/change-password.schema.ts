import { z } from "zod";

/** Backend `ChangePasswordDto` (user-profile/dto/change-password.dto.ts) exactly mirror করে — same 12–128 length rule project-wide. */
export interface ChangePasswordFormMessages {
  currentPasswordRequired: string;
  newPasswordLength: string;
  confirmPasswordMismatch: string;
}

export function createChangePasswordSchema(messages: ChangePasswordFormMessages) {
  return z
    .object({
      currentPassword: z.string().min(1, { error: messages.currentPasswordRequired }),
      newPassword: z
        .string()
        .min(12, { error: messages.newPasswordLength })
        .max(128, { error: messages.newPasswordLength }),
      confirmNewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      error: messages.confirmPasswordMismatch,
      path: ["confirmNewPassword"],
    });
}

export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>;
