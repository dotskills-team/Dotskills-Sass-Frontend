import type { SupplierFormValues } from "@/features/supplier/schemas/supplier.schema";

export interface SupplierMutationPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export function toSupplierPayload(values: SupplierFormValues): SupplierMutationPayload {
  return {
    name: values.name.trim(),
    phone: values.phone?.trim() || undefined,
    email: values.email?.trim() || undefined,
    address: values.address?.trim() || undefined,
  };
}
