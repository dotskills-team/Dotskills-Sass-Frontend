import { z } from "zod";

/** Backend `UpdateCompanySettingsDto` mirrored exactly (verified company-settings/dto/company-settings.dto.ts): all boolean toggles, maxCustomerDueLimit (>=0, max 4 decimals), defaultTaxRate (>=0, max 3 decimals). */
export interface CompanySettingsFormMessages {
  maxCustomerDueLimitNonNegative: string;
  defaultTaxRateNonNegative: string;
}

export function createCompanySettingsSchema(messages: CompanySettingsFormMessages) {
  return z.object({
    enableMultiUnit: z.boolean(),
    enableCustomerDue: z.boolean(),
    enableBarcode: z.boolean(),
    enableProductVariant: z.boolean(),
    enableComboOffer: z.boolean(),
    enableMultiLocation: z.boolean(),
    allowNegativeStock: z.boolean(),
    maxCustomerDueLimit: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || Number(value) >= 0, { error: messages.maxCustomerDueLimitNonNegative }),
    enableTax: z.boolean(),
    defaultTaxRate: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || Number(value) >= 0, { error: messages.defaultTaxRateNonNegative }),
  });
}

export type CompanySettingsFormValues = z.infer<ReturnType<typeof createCompanySettingsSchema>>;
