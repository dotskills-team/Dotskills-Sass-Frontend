import { z } from "zod";

/**
 * Backend-এর `CreateCompanyDto`/`UpdateCompanyDto` (company-management/dto/*.ts) exactly
 * mirror করে: `code` 2–50 chars `^[A-Z0-9_-]+$`, `legalName`/`tradeName` 2–200 chars,
 * `email` valid email, `phone` 5–30 chars, `taxId`/`registrationNo` 2–100 chars,
 * `baseCurrencyCode` exactly 3 chars, `timezone` 2–100 chars — কোনো নিয়ম invent করা হয়নি।
 */
export interface CompanyFormMessages {
  tenantRequired: string;
  industryRequired: string;
  codeRequired: string;
  codeLength: string;
  codePattern: string;
  legalNameRequired: string;
  legalNameLength: string;
  tradeNameLength: string;
  emailInvalid: string;
  phoneLength: string;
  taxIdLength: string;
  registrationNoLength: string;
  currencyLength: string;
  timezoneLength: string;
}

export function createCompanySchema(messages: CompanyFormMessages) {
  return z.object({
    tenantId: z.string({ error: messages.tenantRequired }).min(1, { error: messages.tenantRequired }),
    industryId: z.string({ error: messages.industryRequired }).min(1, { error: messages.industryRequired }),
    code: z
      .string({ error: messages.codeRequired })
      .min(1, { error: messages.codeRequired })
      .min(2, { error: messages.codeLength })
      .max(50, { error: messages.codeLength })
      .regex(/^[A-Z0-9_-]+$/, { error: messages.codePattern }),
    legalName: z
      .string({ error: messages.legalNameRequired })
      .min(1, { error: messages.legalNameRequired })
      .min(2, { error: messages.legalNameLength })
      .max(200, { error: messages.legalNameLength }),
    tradeName: z.string().max(200, { error: messages.tradeNameLength }).optional().or(z.literal("")),
    email: z.string().max(200).email({ error: messages.emailInvalid }).optional().or(z.literal("")),
    phone: z
      .string()
      .min(5, { error: messages.phoneLength })
      .max(30, { error: messages.phoneLength })
      .optional()
      .or(z.literal("")),
    taxId: z.string().max(100, { error: messages.taxIdLength }).optional().or(z.literal("")),
    registrationNo: z.string().max(100, { error: messages.registrationNoLength }).optional().or(z.literal("")),
    baseCurrencyCode: z
      .string()
      .length(3, { error: messages.currencyLength })
      .optional()
      .or(z.literal("")),
    timezone: z.string().max(100, { error: messages.timezoneLength }).optional().or(z.literal("")),
  });
}

export type CompanyFormValues = z.infer<ReturnType<typeof createCompanySchema>>;
