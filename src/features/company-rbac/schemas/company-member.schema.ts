import { z } from "zod";

/** Backend `CreateCompanyMemberDto` (company-rbac/dto/company-rbac.dto.ts) exactly mirror করে। */
export interface CompanyMemberFormMessages {
  emailRequired: string;
  emailInvalid: string;
  fullNameRequired: string;
  fullNameLength: string;
  passwordLength: string;
  employeeCodeLength: string;
  designationLength: string;
}

export function createCompanyMemberSchema(messages: CompanyMemberFormMessages) {
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
    password: z
      .string()
      .min(12, { error: messages.passwordLength })
      .max(128, { error: messages.passwordLength })
      .optional()
      .or(z.literal("")),
    employeeCode: z.string().max(50, { error: messages.employeeCodeLength }).optional().or(z.literal("")),
    designation: z.string().max(120, { error: messages.designationLength }).optional().or(z.literal("")),
  });
}

export type CompanyMemberFormValues = z.infer<ReturnType<typeof createCompanyMemberSchema>>;
