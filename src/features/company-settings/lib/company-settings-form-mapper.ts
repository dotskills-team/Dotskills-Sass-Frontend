import type { CompanySettingsFormValues } from "@/features/company-settings/schemas/company-settings.schema";
import type { CompanySettings } from "@/types/company-settings";

export interface CompanySettingsMutationPayload {
  enableMultiUnit: boolean;
  enableCustomerDue: boolean;
  enableBarcode: boolean;
  enableMultiLocation: boolean;
  allowNegativeStock: boolean;
  maxCustomerDueLimit?: number;
  maxSupplierPayableLimit?: number;
  enableTax: boolean;
  defaultTaxRate?: number;
}

export function toCompanySettingsPayload(values: CompanySettingsFormValues): CompanySettingsMutationPayload {
  return {
    enableMultiUnit: values.enableMultiUnit,
    enableCustomerDue: values.enableCustomerDue,
    enableBarcode: values.enableBarcode,
    enableMultiLocation: values.enableMultiLocation,
    allowNegativeStock: values.allowNegativeStock,
    maxCustomerDueLimit: values.maxCustomerDueLimit ? Number(values.maxCustomerDueLimit) : undefined,
    maxSupplierPayableLimit: values.maxSupplierPayableLimit ? Number(values.maxSupplierPayableLimit) : undefined,
    enableTax: values.enableTax,
    defaultTaxRate: values.defaultTaxRate ? Number(values.defaultTaxRate) : undefined,
  };
}

export function toCompanySettingsFormValues(settings: CompanySettings): CompanySettingsFormValues {
  return {
    enableMultiUnit: settings.enableMultiUnit,
    enableCustomerDue: settings.enableCustomerDue,
    enableBarcode: settings.enableBarcode,
    enableMultiLocation: settings.enableMultiLocation,
    allowNegativeStock: settings.allowNegativeStock,
    maxCustomerDueLimit: settings.maxCustomerDueLimit ?? "",
    maxSupplierPayableLimit: settings.maxSupplierPayableLimit ?? "",
    enableTax: settings.enableTax,
    defaultTaxRate: settings.defaultTaxRate,
  };
}
