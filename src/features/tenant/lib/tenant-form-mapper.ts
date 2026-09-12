import type { TenantFormValues } from "@/features/tenant/schemas/tenant.schema";

export interface TenantCreatePayload {
  name: string;
}

export interface TenantUpdatePayload {
  name: string;
}

/** `CreateTenantDto` শুধু `name` নেয় — `code`/`slug` backend system-generate করে (verified)। */
export function toTenantCreatePayload(values: TenantFormValues): TenantCreatePayload {
  return {
    name: values.name.trim(),
  };
}

/** `UpdateTenantDto` শুধু `name` নেয় — `code`/`slug` কখনো user-editable না (verified)। */
export function toTenantUpdatePayload(values: TenantFormValues): TenantUpdatePayload {
  return {
    name: values.name.trim(),
  };
}
