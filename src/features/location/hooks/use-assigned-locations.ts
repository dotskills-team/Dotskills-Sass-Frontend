import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useGetMyLocationAccessQuery } from "@/features/company-rbac/api/company-rbac.api";
import type { Location } from "@/types/location";

/**
 * The full company Location list, filtered down to what the current actor
 * is actually allowed to use (Location-Based Access Control's UX-quality
 * companion — the real security boundary is the backend's
 * LocationAccessService calls, this only keeps the dropdown from ever
 * offering an option the backend would reject anyway).
 */
export function useAssignedLocations(companyId: string | undefined) {
  const {
    data: locations,
    isLoading: isLoadingLocations,
    isFetching: isFetchingLocations,
  } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const {
    data: access,
    isLoading: isLoadingAccess,
    isFetching: isFetchingAccess,
  } = useGetMyLocationAccessQuery(companyId ?? "", { skip: !companyId });

  const isLoading = isLoadingLocations || isLoadingAccess;
  const isFetching = isFetchingLocations || isFetchingAccess;

  if (!locations || !access) {
    return { locations: [] as Location[], isLoading, isFetching };
  }

  if (access.all) {
    return { locations, isLoading, isFetching };
  }

  const assignedIds = new Set(access.locationIds);
  return {
    locations: locations.filter((location) => assignedIds.has(location.id)),
    isLoading,
    isFetching,
  };
}
