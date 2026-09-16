"use client";

import { useSyncExternalStore } from "react";

/**
 * Wraps `navigator.onLine` plus the `online`/`offline` window events —
 * `useSyncExternalStore` is React's own recommended pattern for exactly
 * this (subscribe to a browser API, read its current value), and avoids
 * both a setState-in-effect and any SSR/hydration mismatch: the server
 * snapshot is always `true` (assume online), reconciled to the real value
 * on the client's first paint.
 */
function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
