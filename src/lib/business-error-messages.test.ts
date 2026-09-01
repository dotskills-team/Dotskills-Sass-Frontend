import { describe, expect, it } from "vitest";

import { resolveBusinessErrorMessage, translateBusinessError } from "./business-error-messages";

describe("translateBusinessError", () => {
  it("translates the bare INSUFFICIENT_STOCK conflict (stock transfer dispatch)", () => {
    expect(translateBusinessError("INSUFFICIENT_STOCK", "bn")).toBe("পর্যাপ্ত স্টক নেই এই লোকেশনে।");
    expect(translateBusinessError("INSUFFICIENT_STOCK", "en")).toBe("Not enough stock at this location.");
  });

  it("translates the INSUFFICIENT_STOCK: prefixed variant (purchase return) distinctly from the bare one", () => {
    const message = "INSUFFICIENT_STOCK: not enough stock of product abc-123 at this location to return";
    expect(translateBusinessError(message, "en")).toBe("Not enough stock of this product to return.");
  });

  it("extracts ordered/received quantities from the over-receive message", () => {
    const message = "Cannot receive more than ordered for product xyz (ordered 10, already received 8)";
    expect(translateBusinessError(message, "en")).toBe("Can't receive more than ordered (ordered 10, already received 8).");
    expect(translateBusinessError(message, "bn")).toContain("10");
  });

  it("extracts the current state from the transfer dispatch/receive guard messages", () => {
    expect(translateBusinessError("Transfer cannot be dispatched from IN_TRANSIT state", "en")).toBe(
      "Can't dispatch from IN_TRANSIT state.",
    );
    expect(translateBusinessError("Transfer cannot be received from PENDING state", "en")).toBe(
      "Can't receive from PENDING state.",
    );
  });

  it("matches the not-found messages for all four entities", () => {
    expect(translateBusinessError("Purchase order was not found", "en")).toBe("This record wasn't found.");
    expect(translateBusinessError("Stock transfer was not found", "en")).toBe("This record wasn't found.");
    expect(translateBusinessError("Supplier was not found", "en")).toBe("This record wasn't found.");
    expect(translateBusinessError("Sale was not found", "en")).toBe("This record wasn't found.");
  });

  it("translates the Sale over-sell INSUFFICIENT_STOCK variant distinctly from the purchase-return one", () => {
    const message = "INSUFFICIENT_STOCK: not enough stock for one or more items in this sale";
    expect(translateBusinessError(message, "en")).toBe("Not enough stock for one or more items in this sale.");
    expect(translateBusinessError(message, "bn")).toBe("একটা বা একাধিক আইটেমের জন্য পর্যাপ্ত স্টক নেই।");
  });

  it("translates the DUE-payment-requires-customer message", () => {
    expect(translateBusinessError("A customerId is required when any payment uses the DUE method", "en")).toBe(
      "Select a customer before using the Due payment method.",
    );
  });

  it("translates the payment-total-mismatch message regardless of the exact numbers", () => {
    const message = "Sum of payments (450) must equal the computed total (500)";
    expect(translateBusinessError(message, "en")).toBe("Payment total doesn't match the bill total.");
  });

  it("translates the sale-productId-not-found and not-part-of-sale messages", () => {
    expect(translateBusinessError("productId abc-123 does not belong to this company", "en")).toBe(
      "One of the selected products wasn't found.",
    );
    expect(translateBusinessError("productId abc-123 was not part of this sale", "en")).toBe(
      "That product wasn't part of this sale.",
    );
  });

  it("extracts the current state from the Sale void/return guard messages", () => {
    expect(translateBusinessError("Sale cannot be voided from VOIDED state", "en")).toBe(
      "Can't void a sale in VOIDED state.",
    );
    expect(translateBusinessError("Cannot return items for a sale in VOIDED state", "en")).toBe(
      "Can't return items for a sale in VOIDED state.",
    );
  });

  it("translates the concurrent-open-session rejection", () => {
    expect(translateBusinessError("An open cash drawer session already exists for this cashier", "en")).toBe(
      "You already have a session open — close it before opening a new one.",
    );
  });

  it("translates the cash drawer locationId/openingBalance/not-found messages", () => {
    expect(translateBusinessError("locationId does not belong to this company", "en")).toBe(
      "This location wasn't found.",
    );
    expect(
      translateBusinessError(
        "openingBalance is required for this cashier's first session at this location",
        "en",
      ),
    ).toBe("This is your first session at this location — enter a starting balance.");
    expect(translateBusinessError("Cash drawer session was not found", "en")).toBe("This record wasn't found.");
  });

  it("extracts the current state from the cash drawer close guard message", () => {
    expect(translateBusinessError("Cannot close a session with status CLOSED", "en")).toBe(
      "Can't close a session in CLOSED state.",
    );
  });

  it("returns null for an unrecognized message", () => {
    expect(translateBusinessError("Some completely new backend error", "en")).toBeNull();
  });
});

describe("resolveBusinessErrorMessage", () => {
  it("falls back to the raw normalized message when unrecognized", () => {
    expect(resolveBusinessErrorMessage("Some completely new backend error", "en")).toBe(
      "Some completely new backend error",
    );
  });

  it("uses the translated message when recognized", () => {
    expect(resolveBusinessErrorMessage("INSUFFICIENT_STOCK", "bn")).toBe("পর্যাপ্ত স্টক নেই এই লোকেশনে।");
  });
});
