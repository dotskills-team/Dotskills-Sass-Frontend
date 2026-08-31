export type SupplierStatus = "ACTIVE" | "INACTIVE";

/** `GET /companies/:companyId/suppliers` item (verified `SUPPLIER_SELECT` in supplier.service.ts). `payableBalance` is server-maintained, never client-settable. */
export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  payableBalance: string;
  status: SupplierStatus;
  createdAt: string;
  updatedAt: string;
}
