"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useListProductsQuery } from "@/features/product/api/product.api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Product } from "@/types/product";

const SEARCH_RESULT_LIMIT = 20;

interface ProductSearchSelectProps {
  companyId: string;
  value: string;
  onChange: (product: Product) => void;
  placeholder: string;
}

/**
 * Reuses the exact same search mechanism already proven in POS/Product
 * List (`useDebouncedValue` + `useListProductsQuery({search})`, the same
 * backend name/sku/barcode search param) — deliberately not POS's
 * `ProductSearchInput` verbatim, since that component's barcode-scan
 * detection and "select then clear" behavior are specific to a checkout
 * flow, not a persistent form field. This one instead shows the selected
 * product's name once picked (tracked locally, since the form only holds
 * the productId string) and reopens the search when clicked again.
 */
export function ProductSearchSelect({ companyId, value, onChange, placeholder }: ProductSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 300).trim();
  const { data } = useListProductsQuery(
    { companyId, search: debouncedQuery, limit: SEARCH_RESULT_LIMIT },
    { skip: !companyId || debouncedQuery.length === 0 },
  );
  const results = data?.items ?? [];
  const showDropdown = query.trim().length > 0 && results.length > 0;

  function handleSelect(product: Product) {
    setSelectedLabel(`${product.name} (${product.sku})`);
    setQuery("");
    onChange(product);
  }

  return (
    <div className="relative">
      <Input
        value={query || selectedLabel || ""}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelectedLabel(null);
        }}
        onFocus={() => {
          if (selectedLabel) setQuery("");
        }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelect(product)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent",
                product.id === value && "bg-accent",
              )}
            >
              <span>
                {product.name} <span className="text-muted-foreground">({product.sku})</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
