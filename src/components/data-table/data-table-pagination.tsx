"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

/** `meta === null` (Subscriptions) হলে parent এই component-ই render করবে না — backend pagination সমর্থন না করলে fake pagination দেখানো হয় না। */
export function DataTablePagination({ page, totalPages, total, onPageChange }: DataTablePaginationProps) {
  const t = useTranslations("common");

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-muted-foreground">
        {t("pageOf", { page, totalPages, total })}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {t("back")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("next")}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
