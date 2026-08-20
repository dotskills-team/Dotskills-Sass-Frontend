"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { normalizeApiError } from "@/lib/api-error";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTranslations("common");
  const normalized = normalizeApiError(error);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{normalized.message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
