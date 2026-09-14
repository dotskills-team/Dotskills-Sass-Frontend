import { configureStore, isPlainObject } from "@reduxjs/toolkit";

import { baseApi } from "@/store/api/base-api";
import { authReducer } from "@/store/slices/auth.slice";
import { companyReducer } from "@/store/slices/company.slice";

/**
 * The 6 CSV/XLSX export endpoints (`exportSaleRegister`, `exportPurchaseRegister`,
 * `exportProfitReport`, `exportCustomerDueSummary`, `exportSupplierPayableSummary`,
 * `exportStockReport`) deliberately resolve their `data` to a real `Blob` via a
 * custom `responseHandler` — that's the only way to hand a binary file to
 * `downloadBlob()`. RTK Query then dispatches that `Blob` as the fulfilled
 * action's `payload`, which is exactly what `serializableCheck` exists to flag —
 * but here it's an intentional, correctly-handled non-serializable value, not a
 * bug. Extending the default check to accept `Blob` (alongside RTK's own
 * plain-value rules) keeps the warning meaningful for every other action while
 * silencing this one known, safe case.
 */
export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      company: companyReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          isSerializable: (value: unknown) =>
            value instanceof Blob ||
            value === undefined ||
            value === null ||
            typeof value === "string" ||
            typeof value === "boolean" ||
            typeof value === "number" ||
            Array.isArray(value) ||
            isPlainObject(value),
        },
      }).concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
