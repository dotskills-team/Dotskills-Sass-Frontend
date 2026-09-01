export type CashDrawerSessionStatus = "OPEN" | "CLOSED";

/** `GET /companies/:companyId/cash-drawer-sessions` item (verified `SESSION_SELECT` in cash-drawer.service.ts). */
export interface CashDrawerSession {
  id: string;
  locationId: string;
  cashierId: string;
  status: CashDrawerSessionStatus;
  shiftStart: string;
  shiftEnd: string | null;
  openingBalance: string;
  expectedClosingBalance: string | null;
  actualClosingBalance: string | null;
  variance: string | null;
  note: string | null;
  createdAt: string;
}
