import type { SupplierPaymentFormValues } from "@/features/supplier-payment/schemas/supplier-payment.schema";

export interface SupplierPaymentMutationPayload {
  supplierId: string;
  amount: number;
  note?: string;
}

export function toSupplierPaymentPayload(supplierId: string, values: SupplierPaymentFormValues): SupplierPaymentMutationPayload {
  return {
    supplierId,
    amount: Number(values.amount),
    note: values.note?.trim() ? values.note.trim() : undefined,
  };
}
