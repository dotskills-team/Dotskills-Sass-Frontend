"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useListProductsQuery } from "@/features/product/api/product.api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useBarcodeCapture } from "@/features/pos/hooks/use-barcode-capture";
import type { Product } from "@/types/product";

const SEARCH_RESULT_LIMIT = 20;

interface ProductSearchInputProps {
  companyId: string;
  onSelectProduct: (product: Product) => void;
}

/**
 * One always-focused input serves both a human typing a search term and
 * an HID barcode scanner "typing" a code — see `useBarcodeCapture` for
 * the scan/type discriminator. A hand-rolled dropdown (not a new
 * Popover/Command dependency) is enough for a simple type-ahead list.
 */
export function ProductSearchInput({ companyId, onSelectProduct }: ProductSearchInputProps) {
  const t = useTranslations("pos");
  const [value, setValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { recordKeystroke, resetCapture, isLikelyScan } = useBarcodeCapture();

  const debouncedSearch = useDebouncedValue(value, 300);
  const trimmedSearch = debouncedSearch.trim();

  const { data } = useListProductsQuery(
    { companyId, search: trimmedSearch, limit: SEARCH_RESULT_LIMIT },
    { skip: !companyId || trimmedSearch.length === 0 },
  );
  const results = data?.items ?? [];
  const effectiveHighlightedIndex = Math.min(highlightedIndex, Math.max(results.length - 1, 0));

  function clearAndRefocus() {
    setValue("");
    resetCapture();
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) return;

      if (isLikelyScan(trimmed.length)) {
        const exactMatch = results.find((product) => product.barcode === trimmed);
        if (exactMatch) {
          onSelectProduct(exactMatch);
          clearAndRefocus();
          return;
        }
        if (trimmedSearch === trimmed && results.length === 0) {
          toast.error(t("scanNotFound", { code: trimmed }));
          clearAndRefocus();
          return;
        }
      }

      const selected = results[effectiveHighlightedIndex] ?? results[0];
      if (selected) {
        onSelectProduct(selected);
        clearAndRefocus();
      }
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
      {value.trim() && results.length > 0 && (
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
