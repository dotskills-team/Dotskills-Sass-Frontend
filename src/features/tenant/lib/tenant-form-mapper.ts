import type { TenantFormValues } from "@/features/tenant/schemas/tenant.schema";

export interface TenantCreatePayload {
  code: string;
  name: string;
  slug: string;
}

export interface TenantUpdatePayload {
  name: string;
  slug: string;
}

/** `CreateTenantDto` নেয় code/name/slug সব — backend নিজেই code uppercase/slug lowercase trim করে। */
export function toTenantCreatePayload(values: TenantFormValues): TenantCreatePayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    slug: values.slug.trim(),
  };
}

/** `UpdateTenantDto`-তে `code` field-ই নেই (verified) — তাই edit payload-এ code পাঠানো হয় না। */
export function toTenantUpdatePayload(values: TenantFormValues): TenantUpdatePayload {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
  };
}
