import { useGetMyCompaniesQuery } from "@/features/company/api/company.api";
import { selectCurrentCompany } from "@/features/company/lib/select-current-company";
import { useAppSelector } from "@/store/hooks";

/**
 * Redux-এ শুধু `currentCompanyId` থাকে; company-র বাকি সব তথ্য
 * (name/status/roleCodes/permissions) RTK Query cache থেকে derive করা
 * হয় এখানে — কোথাও duplicate করে রাখা হয় না।
 */
export function useCurrentCompany() {
  const currentCompanyId = useAppSelector((state) => state.company.currentCompanyId);
  const { data: companies, isLoading, isError } = useGetMyCompaniesQuery();

  const company = selectCurrentCompany(companies, currentCompanyId);

  return {
    companies: companies ?? [],
    company,
    permissions: company?.permissions ?? [],
    isLoading,
    isError,
  };
}
