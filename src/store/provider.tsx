"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";

import { makeStore } from "@/store";

/**
 * `setupListeners` RTK Query-এর `refetchOnFocus`/`refetchOnReconnect` enable করে — payment
 * gateway থেকে ফিরে আসার পর tab focus হলে Payment/Invoice status auto-refetch হওয়ার জন্য এটা
 * দরকার (backend-confirmed state দেখানো, frontend নিজে success declare করে না)।
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => {
    const created = makeStore();
    setupListeners(created.dispatch);
    return created;
  });

  return <Provider store={store}>{children}</Provider>;
}
