import { z } from "zod";

/** Backend `RecordSupplierPaymentDto` mirrored exactly (verified supplier-payment.dto.ts): amount > 0 (max 4 decimals), note optional. */
export interface SupplierPaymentFormMessages {
  amountPositive: string;
}

export function createSupplierPaymentSchema(messages: SupplierPaymentFormMessages) {
  return z.object({
    amount: z
      .string()
      .min(1, { error: messages.amountPositive })
      .refine((value) => Number(value) > 0, { error: messages.amountPositive }),
    note: z.string().max(2000).optional().or(z.literal("")),
  });
}

export type SupplierPaymentFormValues = z.infer<ReturnType<typeof createSupplierPaymentSchema>>;
