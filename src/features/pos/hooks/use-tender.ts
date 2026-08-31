import { useState } from "react";

import type { SalePaymentMethod } from "@/types/sale";

export interface TenderLine {
  id: string;
  method: SalePaymentMethod;
  amount: number;
}

function createLine(): TenderLine {
  return { id: crypto.randomUUID(), method: "CASH", amount: 0 };
}

/**
 * Plain local state, same spirit as `useCart` — the split-payment
 * "tender" list isn't a typical field-validated form (no per-field
 * error messages), it's an interactive till total that's checked
 * imperatively right before submit, so a full RHF form would add
 * ceremony without benefit here.
 */
export function useTender() {
  const [lines, setLines] = useState<TenderLine[]>([createLine()]);

  function addLine() {
    setLines((prev) => [...prev, createLine()]);
  }

  function updateMethod(id: string, method: SalePaymentMethod) {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, method } : line)));
  }

  function updateAmount(id: string, amount: number) {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, amount } : line)));
  }

  function removeLine(id: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
  }

  function reset() {
    setLines([createLine()]);
  }

  return { lines, addLine, updateMethod, updateAmount, removeLine, reset };
}
