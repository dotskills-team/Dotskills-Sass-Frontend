import { z } from "zod";

/** Backend `CreateSupplierDto`/`UpdateSupplierDto` mirrored exactly (verified supplier/dto/supplier.dto.ts). `payableBalance` is never part of this form — server-maintained only. */
export interface SupplierFormMessages {
  nameRequired: string;
  nameLength: string;
  emailInvalid: string;
}

export function createSupplierSchema(messages: SupplierFormMessages) {
  return z.object({
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(160, { error: messages.nameLength }),
    phone: z.string().max(32).optional().or(z.literal("")),
    email: z.string().max(200).email({ error: messages.emailInvalid }).optional().or(z.literal("")),
    address: z.string().max(2000).optional().or(z.literal("")),
  });
}

export type SupplierFormValues = z.infer<ReturnType<typeof createSupplierSchema>>;
