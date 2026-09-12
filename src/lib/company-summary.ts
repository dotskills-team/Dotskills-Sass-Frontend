import type { CompanySummary } from "@/types/platform";

/**
 * Every Platform Billing/Invoice/Payment row carries the same `company`
 * shape (see `CompanySummary`) — this is the one place that knows how to
 * read a display name and the current primary owner out of it, reused by
 * every column/detail/receipt component instead of each one re-deriving
 * the same `tradeName || legalName` / `ownerships[0]` logic.
 */
export function getCompanyDisplayName(company: CompanySummary | null | undefined): string {
  if (!company) return "—";
  return company.tradeName || company.legalName;
}

export interface CompanyOwnerInfo {
  name: string;
  email: string;
}

export function getCompanyOwner(company: CompanySummary | null | undefined): CompanyOwnerInfo | null {
  const user = company?.ownerships[0]?.companyMember.user;
  if (!user) return null;
  return { name: user.fullName, email: user.email ?? "—" };
}
