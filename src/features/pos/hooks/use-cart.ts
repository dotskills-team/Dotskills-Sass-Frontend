import { useState } from "react";

import { formatVariantLabel } from "@/features/product/lib/format-variant-label";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";

export interface CartLine {
  productId: string;
  productName: string;
  sku: string;
  sellByWeight: boolean;
  /** The Product's own base unit (e.g. "Piece") — needed so `pos-cart.tsx` can look up which other Units this line is allowed to switch to (only ones that convert directly to this). */
  baseUnitId: string;
  /** salePrice per ONE of the Product's base unit, captured at add-time — the anchor `updateUnit` rescales from whenever the cashier switches this line's unit. Never itself shown to the cashier; `unitPrice` (below) is. */
  baseSalePrice: number;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  variantId?: string;
  /** "Red / S" — undefined for a non-variant line, so `pos-cart.tsx` can decide whether to render the sub-label at all. */
  variantLabel?: string;
  /** Undefined = the Product's own base unit (the common case, unchanged from before this feature). Set only when the cashier explicitly switches this line to a different Unit (e.g. "Carton"). */
  unitId?: string;
  unitLabel?: string;
  /** Free-text serial/IMEI captured at sale time — a manual note only, never validated or checked for uniqueness. */
  serialNote?: string;
}

/**
 * Local component state, not Redux — the cart only ever exists for the
 * duration of one POS session and is never read anywhere else, matching
 * Section ১২.৭'s optimistic-UI intent: adding a product updates this
 * state (and therefore the screen) instantly, with no network round-trip.
 * A scanned/re-selected weight-based product always gets its own new
 * line (each weigh-in is a distinct measurement); a non-weight product
 * already in the cart just has its quantity incremented.
 */
export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  /**
   * `variant` is required by the caller whenever `product.hasVariants` is
   * true (enforced at the call site in `pos/page.tsx`, via
   * `VariantSelectDialog` gating add-to-cart) — a variant-tracked product
   * is never added as a bare product line. Line-merge dedupe now matches
   * on `productId` AND `variantId` (not `productId` alone), so Red/S and
   * Blue/S of the same T-Shirt always stay separate cart lines.
   */
  function addProduct(product: Product, variant?: ProductVariant) {
    setLines((prev) => {
      if (!product.sellByWeight) {
        const existingIndex = prev.findIndex(
          (line) => line.productId === product.id && line.variantId === variant?.id,
        );
        if (existingIndex !== -1) {
          return prev.map((line, index) => (index === existingIndex ? { ...line, quantity: line.quantity + 1 } : line));
        }
      }
      const baseSalePrice = Number(variant?.salePrice ?? product.salePrice);
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: variant?.sku ?? product.sku,
          sellByWeight: product.sellByWeight,
          baseUnitId: product.baseUnitId,
          baseSalePrice,
          unitPrice: baseSalePrice,
          quantity: 1,
          discountAmount: 0,
          variantId: variant?.id,
          variantLabel: variant ? formatVariantLabel(variant) : undefined,
        },
      ];
    });
  }

  function updateQuantity(index: number, quantity: number) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, quantity } : line)));
  }

  function updateDiscount(index: number, discountAmount: number) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, discountAmount } : line)));
  }

  function updateSerialNote(index: number, serialNote: string) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, serialNote } : line)));
  }

  /**
   * Switches a line to a different Unit (or back to the base unit when
   * `unit` is undefined) — rescales `unitPrice` from the line's own
   * `baseSalePrice` (never from whatever `unitPrice` currently shows, so
   * repeated switches never compound rounding). `quantity` is left as-is
   * deliberately: it now means "quantity in the newly selected unit", the
   * same re-enter-if-needed behavior the Purchase Order form already has
   * when its own unit picker changes.
   */
  function updateUnit(index: number, unit: { id: string; name: string; conversionFactor: number } | undefined) {
    setLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              unitId: unit?.id,
              unitLabel: unit?.name,
              unitPrice: unit ? line.baseSalePrice * unit.conversionFactor : line.baseSalePrice,
            }
          : line,
      ),
    );
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function clear() {
    setLines([]);
  }

  return { lines, addProduct, updateQuantity, updateDiscount, updateSerialNote, updateUnit, removeLine, clear };
}
