import { z } from "zod";

/**
 * Backend-এর `CreateCompanyOwnerDto`/`UpdateCompanyOwnerDto` (company-owner/dto/*.ts)
 * exactly mirror করে: `email` valid, `fullName` 2–160 chars, `phone` 5–32 chars optional,
 * `password` 8–100 chars with uppercase+lowercase+number+special char, `designation`
 * 2–120 chars optional — কোনো নিয়ম invent করা হয়নি।
 */
export interface CompanyOwnerFormMessages {
  emailRequired: string;
  emailInvalid: string;
  fullNameRequired: string;
  fullNameLength: string;
  phoneLength: string;
  passwordRequired: string;
  passwordLength: string;
  passwordPattern: string;
  designationLength: string;
}

export function createCompanyOwnerSchema(messages: CompanyOwnerFormMessages, requirePassword: boolean) {
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
    phone: z
      .string()
      .min(5, { error: messages.phoneLength })
      .max(32, { error: messages.phoneLength })
      .optional()
      .or(z.literal("")),
    password: requirePassword
      ? z
          .string({ error: messages.passwordRequired })
          .min(1, { error: messages.passwordRequired })
          .min(8, { error: messages.passwordLength })
          .max(100, { error: messages.passwordLength })
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
            error: messages.passwordPattern,
          })
      : z.string().optional().or(z.literal("")),
    designation: z.string().max(120, { error: messages.designationLength }).optional().or(z.literal("")),
  });
}

export type CompanyOwnerFormValues = z.infer<ReturnType<typeof createCompanyOwnerSchema>>;
