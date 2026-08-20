import type { CompanyOwnerFormValues } from "@/features/company-owner/schemas/company-owner.schema";
import type { CreateCompanyOwnerBody, UpdateCompanyOwnerBody } from "@/features/company-owner/api/company-owner.api";

function trimOrUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** `CreateCompanyOwnerDto` — email/fullName/password required, phone/designation optional। */
export function toCompanyOwnerCreatePayload(values: CompanyOwnerFormValues): CreateCompanyOwnerBody {
  return {
    email: values.email.trim(),
    fullName: values.fullName.trim(),
    phone: trimOrUndefined(values.phone),
    password: values.password ?? "",
    designation: trimOrUndefined(values.designation),
  };
}

/** `UpdateCompanyOwnerDto`-তে `password` নেই (verified) — edit payload-এ password পাঠানো হয় না। */
export function toCompanyOwnerUpdatePayload(values: CompanyOwnerFormValues): UpdateCompanyOwnerBody {
  return {
    email: trimOrUndefined(values.email),
    fullName: trimOrUndefined(values.fullName),
    phone: trimOrUndefined(values.phone),
    designation: trimOrUndefined(values.designation),
  };
}
