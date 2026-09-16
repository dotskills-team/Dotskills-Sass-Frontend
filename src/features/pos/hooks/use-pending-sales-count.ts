"use client";

import { useCallback, useEffect, useState } from "react";

import { listPendingSales, OFFLINE_SALE_QUEUE_CHANGED_EVENT } from "@/features/pos/lib/offline-sale-queue";

/**
 * Just a count for the simple "N sale(s) waiting to sync" indicator — the
 * actual sync loop is a later chunk. `refresh()` is exposed so the POS page
 * can recompute right after queuing a new offline sale, without waiting for
 * a remount.
 */
export function usePendingSalesCount(companyId: string | undefined) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!companyId) {
      setCount(0);
      return;
    }
    const pending = await listPendingSales(companyId);
    setCount(pending.length);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    listPendingSales(companyId).then((pending) => {
      if (!cancelled) setCount(pending.length);
    });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // Reacts to a queue change caused by a DIFFERENT mounted hook instance —
  // e.g. the company layout's auto-sync hook removing synced sales while
  // this instance lives on the POS page — without prop-drilling or a
  // shared store.
  useEffect(() => {
    window.addEventListener(OFFLINE_SALE_QUEUE_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(OFFLINE_SALE_QUEUE_CHANGED_EVENT, refresh);
  }, [refresh]);

  return { count, refresh };
}
