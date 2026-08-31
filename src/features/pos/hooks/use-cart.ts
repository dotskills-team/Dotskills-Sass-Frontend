import { useState } from "react";

import type { Product } from "@/types/product";

export interface CartLine {
  productId: string;
  productName: string;
  sku: string;
  sellByWeight: boolean;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
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

  function addProduct(product: Product) {
    setLines((prev) => {
      if (!product.sellByWeight) {
        const existingIndex = prev.findIndex((line) => line.productId === product.id);
        if (existingIndex !== -1) {
          return prev.map((line, index) => (index === existingIndex ? { ...line, quantity: line.quantity + 1 } : line));
        }
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          sellByWeight: product.sellByWeight,
          unitPrice: Number(product.salePrice),
          quantity: 1,
          discountAmount: 0,
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
