import type { CustomerFormValues } from "@/features/customer/schemas/customer.schema";

export interface CustomerMutationPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  customerType?: "RETAIL" | "WHOLESALE";
}

export function toCustomerPayload(values: CustomerFormValues): CustomerMutationPayload {
  return {
    name: values.name.trim(),
    phone: values.phone?.trim() || undefined,
    email: values.email?.trim() || undefined,
    address: values.address?.trim() || undefined,
    customerType: values.customerType,
  };
}
