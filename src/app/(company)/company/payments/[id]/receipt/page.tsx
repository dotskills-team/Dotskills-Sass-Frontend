"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReceiptDocument } from "@/components/receipt/receipt-document";

import { useGetCompanyPaymentReceiptQuery } from "@/features/company-payment/api/company-payment.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { downloadElementAsPdf } from "@/lib/pdf-download";
import { getReceiptNumber } from "@/lib/receipt";

/** Single-click PDF download — same approach as the Platform receipt page (see `lib/pdf-download.ts`). */
export default function CompanyPaymentReceiptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: payment, isLoading, error, refetch } = useGetCompanyPaymentReceiptQuery(params.id);
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
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PAYMENT_READ} fallback={<PermissionDenied />}>
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between print:hidden">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/company/payments/${params.id}`)}>
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
    </CompanyPermissionGate>
  );
}
