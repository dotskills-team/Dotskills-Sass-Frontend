"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useListProductsQuery, useLazyLookupProductByBarcodeQuery } from "@/features/product/api/product.api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useBarcodeCapture } from "@/features/pos/hooks/use-barcode-capture";
import { normalizeApiError } from "@/lib/api-error";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";

const SEARCH_RESULT_LIMIT = 20;

interface ProductSearchInputProps {
  companyId: string;
    barcodeEnabled?: boolean;

  /** `variant` is set only when a scanned barcode matched a specific ProductVariant's own barcode — the caller can add it straight to the cart without the manual variant-picker dialog. */
  onSelectProduct: (product: Product, variant?: ProductVariant) => void;
}

/**
 * One always-focused input serves both a human typing a search term and
 * an HID barcode scanner "typing" a code — see `useBarcodeCapture` for
 * the scan/type discriminator. A hand-rolled dropdown (not a new
 * Popover/Command dependency) is enough for a simple type-ahead list.
 *
 * The two paths are deliberately independent queries, not one shared
 * one: manual typing keeps the existing fuzzy, 300ms-debounced
 * `listProducts.search`, while a scan fires `lookupProductByBarcode`
 * directly on Enter — an exact-match query hit immediately, with no
 * debounce to race against. A real USB HID scanner can finish typing a
 * 13-digit code and fire Enter well under 300ms; reusing the debounced
 * search results for a scan meant Enter could land before that timer
 * ever elapsed once, silently selecting a stale/wrong result (or none)
 * — this was a real bug, not just a design choice, fixed by giving scans
 * their own direct lookup instead of reusing the debounced search.
 */
export function ProductSearchInput({ companyId, onSelectProduct }: ProductSearchInputProps) {
  const t = useTranslations("pos");
  const [value, setValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { recordKeystroke, resetCapture, isLikelyScan } = useBarcodeCapture();

  const debouncedSearch = useDebouncedValue(value, 300);
  const trimmedSearch = debouncedSearch.trim();

  const { data, isError, error } = useListProductsQuery(
    { companyId, search: trimmedSearch, limit: SEARCH_RESULT_LIMIT },
    { skip: !companyId || trimmedSearch.length === 0 },
  );
  const results = data?.items ?? [];
  // A failed search (network down, backend unreachable) used to just
  // leave `results` empty with no indication why — indistinguishable
  // from "no products matched."
  const searchErrorMessage = isError ? normalizeApiError(error).message : null;
  const effectiveHighlightedIndex = Math.min(highlightedIndex, Math.max(results.length - 1, 0));

  const [triggerBarcodeLookup] = useLazyLookupProductByBarcodeQuery();

  function clearAndRefocus() {
    setValue("");
    resetCapture();
    inputRef.current?.focus();
  }

  /**
   * Every Enter press tries an exact barcode match FIRST, regardless of
   * typing speed — `isLikelyScan` (keystroke-timing) only shapes the UX
   * on a miss (see below), it's never the gate on whether the exact
   * lookup runs at all. A real scanner always wins here since scanned
   * codes match exactly; it also means a developer with no physical
   * scanner can reliably test by typing a real barcode by hand and
   * pressing Enter — the "is this fast enough to be a scan" heuristic
   * would otherwise make manual keyboard testing flaky.
   */
  async function handleEnter(trimmed: string) {
    if (!companyId) return;
    const result = await triggerBarcodeLookup({ companyId, code: trimmed });

    if (result.error) {
      toast.error(normalizeApiError(result.error).message);
      clearAndRefocus();
      return;
    }

    const match = result.data;
    if (match) {
      const isInactive = match.product.status !== "ACTIVE" || (match.variant && match.variant.status !== "ACTIVE");
      if (isInactive) {
        toast.error(t("scanInactive", { code: trimmed }));
        clearAndRefocus();
        return;
      }
      onSelectProduct(match.product, match.variant ?? undefined);
      clearAndRefocus();
      return;
    }

    // No exact barcode match. A real scan (keystroke-timing says so) means
    // this code genuinely isn't in the system — say so plainly, since
    // there's nothing sensible left to fall back to (a scanned code was
    // never meant to be a fuzzy search term). Otherwise, treat it as a
    // normal typed search and select from whatever the debounced search
    // dropdown currently shows, unchanged from before this feature.
    if (isLikelyScan(trimmed.length)) {
      toast.error(t("scanNotFound", { code: trimmed }));
      clearAndRefocus();
      return;
    }

    const selected = results[effectiveHighlightedIndex] ?? results[0];
    if (selected) {
      onSelectProduct(selected);
      clearAndRefocus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) return;
      void handleEnter(trimmed);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex(Math.min(effectiveHighlightedIndex + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex(Math.max(effectiveHighlightedIndex - 1, 0));
      return;
    }
    if (event.key === "Escape") {
      setValue("");
      resetCapture();
      return;
    }

    if (event.key.length === 1) recordKeystroke();
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("searchPlaceholder")}
        autoFocus
        autoComplete="off"
      />
      {value.trim() && searchErrorMessage && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-destructive/50 bg-popover p-3 text-sm text-destructive shadow-md">
          {searchErrorMessage}
        </div>
      )}
      {value.trim() && !searchErrorMessage && results.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md">
          {results.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onSelectProduct(product);
                clearAndRefocus();
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent",
                index === effectiveHighlightedIndex && "bg-accent",
              )}
            >
              <span>
                {product.name} <span className="text-muted-foreground">({product.sku})</span>
              </span>
              <span className="tabular-nums text-muted-foreground">{Number(product.salePrice).toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
