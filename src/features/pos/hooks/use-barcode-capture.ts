import { useRef } from "react";

const SCAN_MIN_LENGTH = 4;
const SCAN_MAX_AVG_INTERVAL_MS = 50;

/**
 * A HID barcode scanner types into whatever input has focus and always
 * ends with Enter — no human reaches this typing speed, which is exactly
 * the discriminator the design doc names (Section ৮.৯). Tracks keystroke
 * timestamps for the entry currently being typed; `isLikelyScan` is
 * checked on Enter to decide whether to treat the input as a scanned
 * barcode (exact-match lookup) or a normal search (dropdown selection).
 */
export function useBarcodeCapture() {
  const timestampsRef = useRef<number[]>([]);

  function recordKeystroke() {
    timestampsRef.current.push(Date.now());
  }

  function resetCapture() {
    timestampsRef.current = [];
  }

  function isLikelyScan(valueLength: number): boolean {
    const timestamps = timestampsRef.current;
    if (valueLength < SCAN_MIN_LENGTH || timestamps.length < 2) return false;

    const deltas: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      deltas.push(timestamps[i] - timestamps[i - 1]);
    }
    const averageInterval = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
    return averageInterval < SCAN_MAX_AVG_INTERVAL_MS;
  }

  return { recordKeystroke, resetCapture, isLikelyScan };
}
