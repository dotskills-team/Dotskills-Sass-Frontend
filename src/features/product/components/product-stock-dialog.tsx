// "use client";

// import { useTranslations } from "next-intl";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { ErrorState } from "@/components/shared/error-state";
// import { EmptyState } from "@/components/shared/empty-state";
// import { Skeleton } from "@/components/ui/skeleton";

// import { useListStockReportQuery } from "@/features/stock-report/api/stock-report.api";
// import type { Product } from "@/types/product";

// /** Product-primary view of the Location-wise Stock Visibility micro-chunk — every Location's quantity for this one Product, capped at 200 rows (a shop's Location count is naturally small, so this is complete in practice). */
// export function ProductStockDialog({
//   companyId,
//   product,
//   open,
//   onOpenChange,
// }: {
//   companyId: string;
//   product: Product;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }) {
//   const t = useTranslations("products");

//   const { data, isLoading, error, refetch } = useListStockReportQuery(
//     { companyId, productId: product.id, limit: 200 },
//     { skip: !open || !companyId },
//   );

//   const items = data?.items ?? [];
//   const total = data?.meta?.total ?? 0;
//   const limit = data?.meta?.limit ?? 200;
//   const isTruncated = total > limit;
//   // A variant product's rows are per (location, variant) — without a
//   // Variant column, two rows for the same Location (one per variant)
//   // would be indistinguishable. Only shown when actually needed, so a
//   // plain non-variant product's view stays exactly as it was.
//   const hasAnyVariantRow = items.some((item) => item.variantId);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-xl">
//         <DialogHeader>
//           <DialogTitle>{t("stock.title", { name: product.name })}</DialogTitle>
//           <DialogDescription>{t("stock.description")}</DialogDescription>
//         </DialogHeader>

//         {isLoading ? (
//           <Skeleton className="h-40 w-full" />
//         ) : error ? (
//           <ErrorState error={error} onRetry={refetch} />
//         ) : items.length === 0 ? (
//           <EmptyState title={t("stock.empty")} />
//         ) : (
//           <div className="space-y-3">
//             {isTruncated && (
//               <Alert>
//                 <AlertDescription>{t("stock.truncatedNotice", { shown: items.length, total })}</AlertDescription>
//               </Alert>
//             )}
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>{t("stock.columns.location")}</TableHead>
//                   {hasAnyVariantRow && <TableHead>{t("variants.variantsTitle")}</TableHead>}
//                   <TableHead className="text-right">{t("stock.columns.quantity")}</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {items.map((item) => (
//                   <TableRow key={item.id}>
//                     <TableCell>{item.location.name}</TableCell>
//                     {hasAnyVariantRow && (
//                       <TableCell className="text-muted-foreground">
//                         {item.variantId ? item.displayName.replace(`${product.name} — `, "") : "—"}
//                       </TableCell>
//                     )}
//                     <TableCell className="text-right tabular-nums">
//                       <span className="inline-flex items-center gap-2">
//                         {Number(item.quantity).toLocaleString()}
//                         {item.belowReorderLevel && (
//                           <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning">
//                             {t("stock.lowStock")}
//                           </Badge>
//                         )}
//                       </span>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Copy, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import Barcode from "react-barcode";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

import { useListStockReportQuery } from "@/features/stock-report/api/stock-report.api";
import type { Product } from "@/types/product";

/* ------------------------------------------------------------------ */
/* Labels for the new UI (self-contained: no translation JSON changes) */
/* ------------------------------------------------------------------ */

const LABELS = {
  en: {
    totalStock: "Total stock",
    locations: "Locations",
    lowStock: "Low stock items",
    barcode: "Barcode",
    barcodeHint: "Scannable product label",
    copy: "Copy",
    copied: "Copied",
    print: "Print",
    png: "PNG",
    downloading: "Preparing…",
    sku: "SKU",
    price: "Price",
    copySuccess: "Barcode copied.",
    copyFail: "Could not copy the barcode.",
    notReady: "Barcode is not ready yet.",
    printFail: "Could not open the print dialog.",
    pngFail: "Could not generate the PNG.",
    pngSuccess: "Barcode PNG downloaded.",
  },
  bn: {
    totalStock: "মোট স্টক",
    locations: "লোকেশন",
    lowStock: "কম স্টকের আইটেম",
    barcode: "বারকোড",
    barcodeHint: "স্ক্যানযোগ্য পণ্যের লেবেল",
    copy: "কপি",
    copied: "কপি হয়েছে",
    print: "প্রিন্ট",
    png: "PNG",
    downloading: "তৈরি হচ্ছে…",
    sku: "SKU",
    price: "মূল্য",
    copySuccess: "বারকোড কপি হয়েছে।",
    copyFail: "বারকোড কপি করা যায়নি।",
    notReady: "বারকোড এখনো প্রস্তুত নয়।",
    printFail: "প্রিন্ট ডায়ালগ খোলা যায়নি।",
    pngFail: "PNG তৈরি করা যায়নি।",
    pngSuccess: "বারকোড PNG ডাউনলোড হয়েছে।",
  },
} as const;

// type Labels = (typeof LABELS)["en"];
type Labels = Record<keyof (typeof LABELS)["en"], string>;

function useLabels(): Labels {
  const locale = useLocale();
  return locale === "bn" ? LABELS.bn : LABELS.en;
}

/* ------------------------------------------------------------------ */
/* Dialog                                                              */
/* ------------------------------------------------------------------ */

interface ProductStockDialogProps {
  companyId: string;
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Product-primary stock view (every Location's quantity for one Product,
 * capped at 200 rows) plus barcode tools.
 *
 * The stock section and the barcode card are independent on purpose: the
 * barcode depends only on `product.barcode`, so it is always available —
 * even while stock is loading, failed, or the product has no inventory
 * rows yet.
 */
export function ProductStockDialog({
  companyId,
  product,
  open,
  onOpenChange,
}: ProductStockDialogProps) {
  const t = useTranslations("products");
  const l = useLabels();

  const { data, isLoading, error, refetch } = useListStockReportQuery(
    { companyId, productId: product.id, limit: 200 },
    { skip: !open || !companyId },
  );

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.meta?.total ?? 0;
  const limit = data?.meta?.limit ?? 200;
  const isTruncated = total > limit;

  // A variant product's rows are per (location, variant): show the Variant
  // column only when needed so a plain product's view stays unchanged.
  const hasAnyVariantRow = items.some((item) => item.variantId);

  const totalStock = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items],
  );
  const locationCount = useMemo(
    () => new Set(items.map((item) => item.location.name)).size,
    [items],
  );
  const lowStockCount = useMemo(
    () => items.filter((item) => item.belowReorderLevel).length,
    [items],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("stock.title", { name: product.name })}</DialogTitle>
          <DialogDescription>{t("stock.description")}</DialogDescription>
        </DialogHeader>

        {/* ---------- Summary tiles ---------- */}
        <div className="grid grid-cols-3 gap-3">
          <StatTile label={l.totalStock} loading={isLoading} failed={Boolean(error)} value={totalStock} emphasized />
          <StatTile label={l.locations} loading={isLoading} failed={Boolean(error)} value={locationCount} />
          <StatTile label={l.lowStock} loading={isLoading} failed={Boolean(error)} value={lowStockCount} warn={lowStockCount > 0} />
        </div>

        {/* ---------- Barcode (independent of the stock query) ---------- */}
        {product.barcode ? <BarcodeCard product={product} barcode={product.barcode} labels={l} /> : null}

        {/* ---------- Location-wise stock ---------- */}
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState title={t("stock.empty")} />
        ) : (
          <div className="space-y-3">
            {isTruncated && (
              <Alert>
                <AlertDescription>
                  {t("stock.truncatedNotice", { shown: items.length, total })}
                </AlertDescription>
              </Alert>
            )}
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("stock.columns.location")}</TableHead>
                    {hasAnyVariantRow && <TableHead>{t("variants.variantsTitle")}</TableHead>}
                    <TableHead className="text-right">{t("stock.columns.quantity")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.location.name}</TableCell>
                      {hasAnyVariantRow && (
                        <TableCell className="text-muted-foreground">
                          {item.variantId ? item.displayName.replace(`${product.name} — `, "") : "—"}
                        </TableCell>
                      )}
                      <TableCell className="text-right tabular-nums">
                        <span className="inline-flex items-center gap-2">
                          {Number(item.quantity).toLocaleString()}
                          {item.belowReorderLevel && (
                            <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning">
                              {t("stock.lowStock")}
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Stat tile                                                           */
/* ------------------------------------------------------------------ */

function StatTile({
  label,
  value,
  loading,
  failed,
  emphasized,
  warn,
}: {
  label: string;
  value: number;
  loading: boolean;
  failed: boolean;
  emphasized?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : failed ? (
        <p className="mt-2 text-2xl font-semibold text-muted-foreground">—</p>
      ) : (
        <p
          className={[
            "mt-2 font-bold tabular-nums tracking-tight",
            emphasized ? "text-3xl" : "text-2xl",
            warn ? "text-warning" : "",
          ].join(" ")}
        >
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Barcode card                                                        */
/* ------------------------------------------------------------------ */

function BarcodeCard({
  product,
  barcode,
  labels: l,
}: {
  product: Product;
  barcode: string;
  labels: Labels;
}) {
  const barcodeRef = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const priceText = formatPrice(product.salePrice);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(barcode);
      setCopied(true);
      toast.success(l.copySuccess);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(l.copyFail);
    }
  }

  function handlePrint() {
    const svg = barcodeRef.current?.querySelector("svg");
    if (!svg) {
      toast.error(l.notReady);
      return;
    }

    const ok = printInHiddenFrame(
      buildLabelHtml({
        name: product.name,
        sku: product.sku,
        barcode,
        price: priceText,
        svgMarkup: svg.outerHTML,
        skuLabel: l.sku,
        priceLabel: l.price,
      }),
    );

    if (!ok) toast.error(l.printFail);
  }

  function handleDownloadPng() {
    const svg = barcodeRef.current?.querySelector("svg");
    if (!svg) {
      toast.error(l.notReady);
      return;
    }

    setIsDownloading(true);

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgW = Number(svg.getAttribute("width")) || 300;
    const svgH = Number(svg.getAttribute("height")) || 80;
    clone.setAttribute("width", String(svgW));
    clone.setAttribute("height", String(svgH));

    const svgUrl = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(clone)], {
        type: "image/svg+xml;charset=utf-8",
      }),
    );

    const fail = () => {
      URL.revokeObjectURL(svgUrl);
      setIsDownloading(false);
      toast.error(l.pngFail);
    };

    const image = new Image();
    image.onerror = fail;
    image.onload = () => {
      try {
        const scale = 3;
        const width = 800;
        // const barcodeW = 640;
        const barcodeW = 400
        const barcodeH = Math.round((barcodeW * svgH) / svgW); // preserve aspect ratio
        const height = 130 + barcodeH + 100;

        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          fail();
          return;
        }

        ctx.scale(scale, scale);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = "center";

        // Product name, shrunk until it fits.
        ctx.fillStyle = "#000000";
        let fontSize = 32;
        ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
        while (ctx.measureText(product.name).width > width - 80 && fontSize > 16) {
          fontSize -= 2;
          ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
        }
        ctx.fillText(product.name, width / 2, 52);

        ctx.fillStyle = "#444444";
        ctx.font = "20px Arial, Helvetica, sans-serif";
        ctx.fillText(`SKU: ${product.sku}`, width / 2, 86);

        ctx.drawImage(image, (width - barcodeW) / 2, 110, barcodeW, barcodeH);

        ctx.fillStyle = "#000000";
        ctx.font = "600 24px Arial, Helvetica, sans-serif";
        ctx.fillText(barcode, width / 2, 110 + barcodeH + 38);
        ctx.font = "600 22px Arial, Helvetica, sans-serif";
        ctx.fillText(`Price: ${priceText}`, width / 2, 110 + barcodeH + 74);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(svgUrl);
          if (!blob) {
            setIsDownloading(false);
            toast.error(l.pngFail);
            return;
          }
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `${toSafeFileName(product.name)}-${barcode}.png`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(pngUrl), 5000);
          setIsDownloading(false);
          toast.success(l.pngSuccess);
        }, "image/png");
      } catch {
        fail();
      }
    };
    image.src = svgUrl;
  }

  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">{l.barcode}</h3>
          <p className="text-xs text-muted-foreground">{l.barcodeHint}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="mr-1.5 size-4" aria-hidden="true" />
            ) : (
              <Copy className="mr-1.5 size-4" aria-hidden="true" />
            )}
            {copied ? l.copied : l.copy}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 size-4" aria-hidden="true" />
            {l.print}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleDownloadPng} disabled={isDownloading}>
            <Download className="mr-1.5 size-4" aria-hidden="true" />
            {isDownloading ? l.downloading : l.png}
          </Button>
        </div>
      </div>

      {/* On-screen preview only; print and PNG build their own layout. */}
      <div className="overflow-auto rounded-xl border bg-muted/30 p-4">
        <div className="mx-auto w-fit max-w-full rounded-md bg-white p-4 text-center text-black shadow-sm">
          <p className="max-w-[260px] break-words text-sm font-bold leading-tight">{product.name}</p>
          <p className="mb-2 text-xs text-gray-600">
            {l.sku}: {product.sku}
          </p>
          <div ref={barcodeRef} className="flex justify-center">
            {/* <Barcode value={barcode} format="CODE128" width={2} height={55} displayValue={false} margin={0} /> */}
            <Barcode value={barcode} format="CODE128" width={1} height={40} displayValue={false} margin={0} />
          </div>
          <p className="mt-1 text-xs font-semibold tracking-wide">{barcode}</p>
          <p className="mt-1 text-xs text-gray-600">
            {l.price}: {priceText}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Printing (hidden iframe: no pop-up blocker issues)                  */
/* ------------------------------------------------------------------ */

function buildLabelHtml(args: {
  name: string;
  sku: string;
  barcode: string;
  price: string;
  svgMarkup: string;
  skuLabel: string;
  priceLabel: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(args.name)}</title>
<style>
  @page { size: 80mm 60mm; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; font-family: Arial, Helvetica, sans-serif; }
  .label { width: 80mm; min-height: 60mm; padding: 5mm; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .name { max-width: 70mm; font-size: 12pt; font-weight: 700; line-height: 1.2; word-break: break-word; margin-bottom: 1.5mm; }
  .sku { font-size: 8pt; color: #333; margin-bottom: 3mm; }
  .label svg { display: block; max-width: 70mm; height: auto; }

  
  .code { margin-top: 2mm; font-size: 9pt; font-weight: 600; letter-spacing: .5px; }
  .price { margin-top: 2mm; font-size: 9pt; font-weight: 600; }
</style>
</head>
<body>
  <div class="label">
    <div class="name">${escapeHtml(args.name)}</div>
    <div class="sku">${escapeHtml(args.skuLabel)}: ${escapeHtml(args.sku)}</div>
    ${args.svgMarkup}
    <div class="code">${escapeHtml(args.barcode)}</div>
    <div class="price">${escapeHtml(args.priceLabel)}: ${escapeHtml(args.price)}</div>
  </div>
</body>
</html>`;
}

function printInHiddenFrame(html: string): boolean {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => window.setTimeout(() => iframe.remove(), 300);
  win.onafterprint = cleanup;
  // Fallback in case the browser never fires afterprint.
  window.setTimeout(() => iframe.remove(), 60_000);

  window.setTimeout(() => {
    win.focus();
    win.print();
  }, 200);

  return true;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatPrice(value: string | number): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString() : String(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSafeFileName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}
