import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "@/store/api/base-api";
import { authReducer } from "@/store/slices/auth.slice";
import { companyReducer } from "@/store/slices/company.slice";

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      company: companyReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
