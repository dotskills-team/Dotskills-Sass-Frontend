import { useState } from "react";

import { formatVariantLabel } from "@/features/product/lib/format-variant-label";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";

export interface CartLine {
  productId: string;
  productName: string;
  sku: string;
  sellByWeight: boolean;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  variantId?: string;
  /** "Red / S" — undefined for a non-variant line, so `pos-cart.tsx` can decide whether to render the sub-label at all. */
  variantLabel?: string;
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
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: variant?.sku ?? product.sku,
          sellByWeight: product.sellByWeight,
          unitPrice: Number(variant?.salePrice ?? product.salePrice),
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

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function clear() {
    setLines([]);
  }

  return { lines, addProduct, updateQuantity, updateDiscount, removeLine, clear };
}
