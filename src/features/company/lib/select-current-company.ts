import type { CompanyMembership } from "@/types/company";

export function selectCurrentCompany(
  companies: CompanyMembership[] | undefined,
  currentCompanyId: string | null,
): CompanyMembership | null {
  if (!companies || !currentCompanyId) return null;

  return companies.find((company) => company.companyId === currentCompanyId) ?? null;
}
