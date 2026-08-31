export type CustomerType = "RETAIL" | "WHOLESALE";
export type CustomerStatus = "ACTIVE" | "INACTIVE";

/** `GET /companies/:companyId/customers` item (verified `CUSTOMER_SELECT` in customer.service.ts). `dueBalance` is server-maintained, never client-settable. */
export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  customerType: CustomerType;
  dueBalance: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}
