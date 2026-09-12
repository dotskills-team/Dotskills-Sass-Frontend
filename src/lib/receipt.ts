/**
 * Receipt-only helpers — pure formatting, no new data. A receipt is only
 * ever shown for an already-`SUCCEEDED` Payment (enforced by the backend's
 * `PaymentService.getReceipt()`), so every value here is real
 * database/API data; nothing is fabricated.
 */

/** DotSkills has no dedicated ReceiptSequence — the Invoice number (already unique, already system-generated) is the safe, zero-schema-change basis for a receipt number. */
export function getReceiptNumber(invoiceNumber: string): string {
  return `RCPT-${invoiceNumber.replace(/^INV-/, "")}`;
}

/**
 * No card PAN is ever stored (SSLCommerz is redirect-based; the only
 * "payment information" this system ever holds is the provider name and
 * its own generated transaction id) — this masks that transaction id to
 * the conventional last-4-visible receipt style, it does not hide any
 * genuinely sensitive value.
 */
export function maskPaymentReference(transactionId: string): string {
  if (transactionId.length <= 4) return transactionId;
  return `•••• ${transactionId.slice(-4)}`;
}

export function getPaymentMethodLabel(provider: string, metadata?: Record<string, unknown> | null): string {
  if (provider === "MANUAL") {
    const note = typeof metadata?.note === "string" ? metadata.note : undefined;
    return note ? `Manual payment — ${note}` : "Manual payment";
  }
  return provider;
}
