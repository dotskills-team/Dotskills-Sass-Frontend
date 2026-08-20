import type { CompanyFormValues } from "@/features/company/schemas/company.schema";

export interface CompanyCreatePayload {
  tenantId: string;
  industryId: string;
  code: string;
  legalName: string;
  tradeName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  registrationNo?: string;
  baseCurrencyCode?: string;
  timezone?: string;
}

export interface CompanyUpdatePayload {
  industryId?: string;
  legalName?: string;
  tradeName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  registrationNo?: string;
  baseCurrencyCode?: string;
  timezone?: string;
}

function trimOrUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** `CreateCompanyDto` নেয় tenantId/industryId/code/legalName সব — বাকিগুলো optional। */
export function toCompanyCreatePayload(values: CompanyFormValues): CompanyCreatePayload {
  return {
    tenantId: values.tenantId,
    industryId: values.industryId,
    code: values.code.trim(),
    legalName: values.legalName.trim(),
    tradeName: trimOrUndefined(values.tradeName),
    email: trimOrUndefined(values.email),
    phone: trimOrUndefined(values.phone),
    taxId: trimOrUndefined(values.taxId),
    registrationNo: trimOrUndefined(values.registrationNo),
    baseCurrencyCode: trimOrUndefined(values.baseCurrencyCode),
    timezone: trimOrUndefined(values.timezone),
  };
}

/** `UpdateCompanyDto`-তে `tenantId`/`code` নেই (verified) — edit payload-এ এগুলো পাঠানো হয় না। */
export function toCompanyUpdatePayload(values: CompanyFormValues): CompanyUpdatePayload {
  return {
    industryId: values.industryId,
    legalName: values.legalName.trim(),
    tradeName: trimOrUndefined(values.tradeName),
    email: trimOrUndefined(values.email),
    phone: trimOrUndefined(values.phone),
    taxId: trimOrUndefined(values.taxId),
    registrationNo: trimOrUndefined(values.registrationNo),
    baseCurrencyCode: trimOrUndefined(values.baseCurrencyCode),
    timezone: trimOrUndefined(values.timezone),
  };
}
