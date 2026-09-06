/** `GET /companies/:companyId/settings` (verified `SETTINGS_SELECT` in company-settings.service.ts). Row always exists per-company — no create route. */
export interface CompanySettings {
  id: string;
  enableMultiUnit: boolean;
  enableCustomerDue: boolean;
  enableBarcode: boolean;
  enableProductVariant: boolean;
  enableComboOffer: boolean;
  enableMultiLocation: boolean;
  allowNegativeStock: boolean;
  maxCustomerDueLimit: string | null;
  maxSupplierPayableLimit: string | null;
  enableTax: boolean;
  defaultTaxRate: string;
  /** Lives on Company (identity/branding), flattened onto this response by the backend's `flattenSettings()`. */
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
