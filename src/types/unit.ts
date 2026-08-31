export type UnitStatus = "ACTIVE" | "INACTIVE";

/** `GET /companies/:companyId/units` item (verified `UNIT_SELECT` in unit.service.ts). */
export interface Unit {
  id: string;
  name: string;
  code: string;
  baseUnitId: string | null;
  conversionFactor: string;
  status: UnitStatus;
  createdAt: string;
  updatedAt: string;
}
