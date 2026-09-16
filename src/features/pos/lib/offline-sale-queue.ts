import { openDB, type IDBPDatabase } from "idb";

import type { CreateSalePayload } from "@/features/sale/api/sale.api";

const DB_NAME = "dotskills-offline-sales";
const DB_VERSION = 1;
const STORE_NAME = "pendingSales";

/**
 * Fired whenever the queue changes (a sale queued or synced) — lets any
 * mounted consumer (the POS page's pending-count badge, a future header
 * indicator) recompute reactively without prop-drilling or a shared
 * store, the same browser-event-driven approach `useOnlineStatus` already
 * uses. Auto-sync runs from the company layout (always mounted) while the
 * count badge lives on the POS page — two independent components that
 * both need to react to the same underlying IndexedDB change.
 */
export const OFFLINE_SALE_QUEUE_CHANGED_EVENT = "dotskills:offline-sale-queue-changed";

function notifyQueueChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OFFLINE_SALE_QUEUE_CHANGED_EVENT));
  }
}

export interface PendingSale {
  /** The client-generated key sent as `CreateSalePayload.idempotencyKey` — also this record's IndexedDB primary key, so re-queuing the same key overwrites rather than duplicates. */
  idempotencyKey: string;
  companyId: string;
  payload: CreateSalePayload;
  createdAt: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * No service worker, no PWA manifest — this app only needs to persist a
 * handful of POST payloads across a reconnect, not cache network
 * responses or become installable, so the native `idb` wrapper over plain
 * IndexedDB is the whole solution. `indexedDB` is absent during SSR (and
 * in a private-browsing edge case in some browsers), so every call here
 * degrades to a no-op rather than throwing.
 */
function getDb(): Promise<IDBPDatabase> | null {
  if (typeof indexedDB === "undefined") return null;
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "idempotencyKey" });
      }
    },
  });
  return dbPromise;
}

export async function queuePendingSale(pending: PendingSale): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put(STORE_NAME, pending);
  notifyQueueChanged();
}

export async function listPendingSales(companyId: string): Promise<PendingSale[]> {
  const db = await getDb();
  if (!db) return [];
  const all = (await db.getAll(STORE_NAME)) as PendingSale[];
  return all.filter((sale) => sale.companyId === companyId);
}

export async function removePendingSale(idempotencyKey: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(STORE_NAME, idempotencyKey);
  notifyQueueChanged();
}
