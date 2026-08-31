export type LocationType = "BRANCH" | "WAREHOUSE";
export type LocationStatus = "ACTIVE" | "INACTIVE";

/** `GET /companies/:companyId/locations` item (verified `LOCATION_SELECT` in location.service.ts). */
export interface Location {
  id: string;
  name: string;
  locationType: LocationType;
  address: string | null;
  isSalesEnabled: boolean;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
}
