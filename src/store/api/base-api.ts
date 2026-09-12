import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { publicEnv } from "@/config/env";
import { accessTokenRefreshed, loggedOut } from "@/store/slices/auth.slice";
import type { RootState } from "@/store";
import type { SessionResult } from "@/types/auth";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: publicEnv.apiUrl,
  prepareHeaders: (headers, { getState }) => {
    const { accessToken } = (getState() as RootState).auth;
    const { currentCompanyId } = (getState() as RootState).company;

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    if (currentCompanyId) {
      headers.set("x-company-id", currentCompanyId);
    }

    return headers;
  },
});

/**
 * একাধিক request একসাথে 401 পেলে যেন শুধু একটাই /api/auth/refresh call
 * হয় (single-flight) — module-level shared promise এর মেকানিজম।
 */
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(
  dispatch: (action: unknown) => void,
): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/refresh", { method: "POST" });

    if (!response.ok) {
      return null;
    }

    const data: SessionResult = await response.json();
    dispatch(accessTokenRefreshed({ accessToken: data.accessToken }));
    return data.accessToken;
  } catch {
    return null;
  }
}

/**
 * "FETCH_ERROR" (network-level fetch failure) বা 500 — staging backend-এর
 * পরিচিত cold-start/Neon-wake-up চরিত্রের সাথে মেলে (Vercel serverless +
 * Neon free-tier auto-suspend, দেখুন memory: vercel-neon-deployment.md)।
 * শুধু read-only query-তে (mutation না — একটা POST duplicate side-effect
 * তৈরি করতে পারে, তাই কখনো silently retry করা হয় না) একবার ~1.5s পর
 * transparently retry করা হয়, যাতে ব্যবহারকারী সেই এক-মুহূর্তের cold
 * start মোটেও দেখতে না পায়।
 */
function isTransientFailure(error: FetchBaseQueryError | undefined): boolean {
  if (!error) return false;
  return error.status === "FETCH_ERROR" || error.status === 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * প্রতিটি backend call এই দিয়ে যায়। 401 পেলে (এবং সেই call টা refresh
 * endpoint নিজে না হলে) একবার silently refresh করে original request
 * exactly once retry করে — retry নিজে আবার এই wrapper দিয়ে না গিয়ে সরাসরি
 * rawBaseQuery কল করে, তাই infinite loop সম্ভব না। Refresh ব্যর্থ হলে
 * auth state clear করে দেয়া হয়।
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = performRefresh(api.dispatch).finally(() => {
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;

    if (newAccessToken) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(loggedOut());
    }
  }

  if (api.type === "query" && isTransientFailure(result.error)) {
    await delay(1500);
    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

/**
 * একটাই central RTK Query instance — feature module-গুলো
 * `baseApi.injectEndpoints(...)` দিয়ে নিজের endpoint যোগ করবে
 * (authApi, companyApi, ...), কোনো আলাদা fetch/axios client নয়।
 *
 * Tag types:
 *   - "Company": GET /auth/me/companies-এর নিজস্ব cache।
 *   - "CompanyScoped": future company-scoped feature endpoint-গুলো
 *     (invoice/billing/payment ইত্যাদি, পরবর্তী phase) এই tag দিয়ে
 *     `providesTags` করবে, যাতে company switch করলে
 *     `switchCompany()` action একবারে সব invalidate করতে পারে —
 *     এখন এই tag ব্যবহার করা কোনো endpoint নেই, শুধু mechanism
 *     ready রাখা হলো।
 *   - "Industry"/"Plan"/"Subscription"/"Billing"/"Invoice"/"Payment":
 *     Phase 5A action mutations (activate/suspend/status-change/
 *     process/retry/... ইত্যাদি) success হলে সংশ্লিষ্ট list query
 *     invalidate করে টেবিল automatically refresh করে — কোনো
 *     page reload বা manual refetch() call ছাড়াই।
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Company",
    "CompanyScoped",
    "Industry",
    "Plan",
    "PlanPrice",
    "PlanFeature",
    "Feature",
    "Subscription",
    "Billing",
    "Invoice",
    "Payment",
    "Tenant",
    "CompanyOwner",
    "CompanyRole",
    "CompanyMember",
    "PlatformStaff",
    "PlatformRole",
    "Location",
    "Category",
    "Unit",
    "Product",
    "Customer",
    "Supplier",
    "CompanySettings",
    "PurchaseOrder",
    "PurchaseReturn",
    "StockTransfer",
    "SupplierPayment",
    "Sale",
    "SaleReturn",
    "CashDrawerSession",
    "StockAdjustment",
    "Notification",
    "CustomerPayment",
    "UserProfile",
    "PlatformSettings",
  ],
  endpoints: () => ({}),
});
