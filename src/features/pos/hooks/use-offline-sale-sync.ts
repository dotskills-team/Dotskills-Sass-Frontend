"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCreateSaleMutation } from "@/features/sale/api/sale.api";
import { listPendingSales, removePendingSale } from "@/features/pos/lib/offline-sale-queue";
import { normalizeApiError } from "@/lib/api-error";

/**
 * Mounted once, app-wide (the company layout — see its own comment for
 * why), so a reconnect syncs the queue no matter which page is open, not
 * only while the cashier happens to be back on POS.
 *
 * Sequential, not parallel — each queued sale is replayed one at a time
 * via the exact same `createSale` mutation POS itself uses (same
 * idempotencyKey already attached at queue time from Chunk 3), so a
 * retried/duplicated sync can never double-create a Sale — the backend's
 * partial-unique-index on `idempotencyKey` is the actual backstop, this
 * is just the normal path exercising it.
 *
 * On a FETCH_ERROR/TIMEOUT_ERROR (genuinely still unreachable — see the
 * memory note on `navigator.onLine` being an unreliable *sole* signal)
 * the whole run stops immediately and every remaining item stays queued
 * for the next reconnect. Any other error (a real rejection — rare, since
 * NEEDS_REVIEW already absorbs the one expected case, insufficient
 * stock) leaves just that one item queued and moves on, so one bad sale
 * can never block the rest of the queue behind it.
 */
export function useOfflineSaleSync(companyId: string | undefined) {
  const t = useTranslations("pos");
  const [createSale] = useCreateSaleMutation();
  const syncingRef = useRef(false);

  const sync = useCallback(async () => {
    if (!companyId || syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    let syncedCount = 0;

    try {
      const pending = await listPendingSales(companyId);
      for (const item of pending) {
        const result = await createSale({ companyId, body: item.payload });

        if ("error" in result) {
          const normalized = normalizeApiError(result.error);
          if (normalized.status === "FETCH_ERROR" || normalized.status === "TIMEOUT_ERROR") {
            break;
          }
          continue;
        }

        await removePendingSale(item.idempotencyKey);
        syncedCount++;
      }
    } finally {
      syncingRef.current = false;
      if (syncedCount > 0) {
        toast.success(t("offline.syncSuccess", { count: syncedCount }));
      }
    }
  }, [companyId, createSale, t]);

  useEffect(() => {
    void sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [sync]);
}
