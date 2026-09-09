import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { defaultLocale, isValidLocale, localeCookieName } from "./config";

/**
 * প্রতিটা message namespace নিজের ফাইলে থাকে (common.json, auth.json, ...) —
 * নতুন feature যোগ হলে শুধু এই array-তে namespace যোগ করলেই চলবে, একটা
 * বিশাল single JSON file নয়। প্রতিটা file-এর top-level key-ই তার
 * namespace (common.json → {app, common}, auth.json → {auth})।
 *
 * URL-এ locale prefix নেই — cookie দিয়ে locale resolve হয় (next-intl-এর
 * officially-supported "without i18n routing" mode)।
 */
const MESSAGE_NAMESPACES = [
  "common",
  "auth",
  "company",
  "rbac",
  "dashboard",
  "companies",
  "companyOwners",
  "companyRbac",
  "companyInvoices",
  "companyPayments",
  "companySubscription",
  "platformStaff",
  "platformRoles",
  "tenants",
  "industries",
  "plans",
  "features",
  "planPrices",
  "planFeatures",
  "subscriptions",
  "billing",
  "invoices",
  "payments",
  "locations",
  "categories",
  "units",
  "products",
  "customers",
  "suppliers",
  "settings",
  "setupWizard",
  "purchaseOrders",
  "stockTransfers",
  "supplierPayments",
  "pos",
  "sales",
  "cashDrawer",
  "reports",
  "stockAdjustments",
  "notifications",
  "customerPayments",
  "userProfile",
] as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(localeCookieName)?.value;
  const locale = isValidLocale(cookieValue) ? cookieValue : defaultLocale;

  const modules = await Promise.all(
    MESSAGE_NAMESPACES.map((namespace) => import(`../../messages/${locale}/${namespace}.json`)),
  );

  const messages = Object.assign({}, ...modules.map((module) => module.default));

  return { locale, messages };
});
