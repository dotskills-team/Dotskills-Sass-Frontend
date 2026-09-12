/**
 * One-click PDF download of an already-rendered DOM node — no server
 * round-trip, no print dialog. `html2canvas-pro` rasterizes the node (so
 * the PDF looks exactly like the on-screen receipt, including our design
 * tokens/print styles), `jsPDF` wraps that image into a single A4 page
 * and triggers the browser's native file download via `.save()`.
 *
 * Uses the `-pro` fork rather than plain `html2canvas` because our design
 * tokens resolve to `oklch()`/`lab()` colors (Tailwind v4 default theme),
 * which upstream `html2canvas` cannot parse and throws on.
 */
export async function downloadElementAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imageData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
