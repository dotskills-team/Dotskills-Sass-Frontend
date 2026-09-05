import { z } from "zod";

/** Backend `RecordCustomerPaymentDto` mirrored exactly (verified customer-payment.dto.ts): amount > 0 (max 4 decimals), note optional. */
export interface CustomerPaymentFormMessages {
  amountPositive: string;
}

export function createCustomerPaymentSchema(messages: CustomerPaymentFormMessages) {
  return z.object({
    amount: z
      .string()
      .min(1, { error: messages.amountPositive })
      .refine((value) => Number(value) > 0, { error: messages.amountPositive }),
    note: z.string().max(2000).optional().or(z.literal("")),
  });
}

export type CustomerPaymentFormValues = z.infer<ReturnType<typeof createCustomerPaymentSchema>>;
