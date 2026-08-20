import { z } from "zod";

/**
 * Backend `CreatePlatformStaffDto`/`UpdatePlatformStaffDto` (platform-staff/dto/platform-staff.dto.ts)
 * exactly mirror করে। `roleCodes` এই schema-র বাইরে (checklist-driven local state হিসেবে
 * form component-এ handle হয়) — DTO-তে সেটা আলাদা `PUT .../roles` endpoint-এর shape।
 */
export interface PlatformStaffFormMessages {
  emailRequired: string;
  emailInvalid: string;
  fullNameRequired: string;
  fullNameLength: string;
  passwordRequired: string;
  passwordLength: string;
  employeeCodeLength: string;
}

export function createPlatformStaffSchema(messages: PlatformStaffFormMessages, requirePassword: boolean) {
  return z.object({
    email: z
      .string({ error: messages.emailRequired })
      .min(1, { error: messages.emailRequired })
      .email({ error: messages.emailInvalid }),
    fullName: z
      .string({ error: messages.fullNameRequired })
      .min(1, { error: messages.fullNameRequired })
      .min(2, { error: messages.fullNameLength })
      .max(160, { error: messages.fullNameLength }),
    password: requirePassword
      ? z
          .string({ error: messages.passwordRequired })
          .min(1, { error: messages.passwordRequired })
          .min(12, { error: messages.passwordLength })
          .max(128, { error: messages.passwordLength })
      : z.string().optional().or(z.literal("")),
    employeeCode: z.string().max(50, { error: messages.employeeCodeLength }).optional().or(z.literal("")),
  });
}

export type PlatformStaffFormValues = z.infer<ReturnType<typeof createPlatformStaffSchema>>;
