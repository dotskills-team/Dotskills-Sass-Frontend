"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReceiptDocument } from "@/components/receipt/receipt-document";

import { useGetPaymentReceiptQuery } from "@/features/payment/api/payment.api";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { downloadElementAsPdf } from "@/lib/pdf-download";
import { getReceiptNumber } from "@/lib/receipt";

/**
 * Single-click PDF download — `html2canvas` + `jsPDF` capture the already-
 * rendered receipt DOM and trigger a direct file download, no print dialog
 * and no server round-trip (see `lib/pdf-download.ts`).
 */
export default function PlatformPaymentReceiptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: payment, isLoading, error, refetch } = useGetPaymentReceiptQuery(params.id);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    if (!receiptRef.current || !payment) return;
    setIsDownloading(true);
    try {
      await downloadElementAsPdf(receiptRef.current, `${getReceiptNumber(payment.invoice.invoiceNumber)}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PAYMENT_READ} fallback={<PermissionDenied />}>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between print:hidden">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/platform/payments/${params.id}`)}>
            <ArrowLeft aria-hidden="true" />
            Back to payment
          </Button>
          {payment && (
            <Button size="sm" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
              Download PDF
            </Button>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="mx-auto h-[600px] max-w-2xl" />
        ) : error ? (
          <div className="mx-auto max-w-2xl">
            <ErrorState error={error} onRetry={refetch} />
          </div>
        ) : payment ? (
          <div ref={receiptRef}>
            <ReceiptDocument payment={payment} />
          </div>
        ) : null}
      </div>
    </PlatformPermissionGate>
  );
}
