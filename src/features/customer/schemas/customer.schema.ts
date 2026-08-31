import { z } from "zod";

/** Backend `CreateCustomerDto`/`UpdateCustomerDto` mirrored exactly (verified customer/dto/customer.dto.ts). `dueBalance` is never part of this form — server-maintained only. */
export interface CustomerFormMessages {
  nameRequired: string;
  nameLength: string;
  emailInvalid: string;
}

export function createCustomerSchema(messages: CustomerFormMessages) {
  return z.object({
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(160, { error: messages.nameLength }),
    phone: z.string().max(32).optional().or(z.literal("")),
    email: z.string().max(200).email({ error: messages.emailInvalid }).optional().or(z.literal("")),
    address: z.string().max(2000).optional().or(z.literal("")),
    customerType: z.enum(["RETAIL", "WHOLESALE"]),
  });
}

export type CustomerFormValues = z.infer<ReturnType<typeof createCustomerSchema>>;
