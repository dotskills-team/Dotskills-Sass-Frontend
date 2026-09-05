import type { CustomerPaymentFormValues } from "@/features/customer-payment/schemas/customer-payment.schema";

export interface CustomerPaymentMutationPayload {
  customerId: string;
  amount: number;
  note?: string;
}

export function toCustomerPaymentPayload(customerId: string, values: CustomerPaymentFormValues): CustomerPaymentMutationPayload {
  return {
    customerId,
    amount: Number(values.amount),
    note: values.note?.trim() ? values.note.trim() : undefined,
  };
}
