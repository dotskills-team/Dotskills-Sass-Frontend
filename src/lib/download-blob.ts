/**
 * Same Blob-URL-then-anchor-click technique `csv-template.ts` already uses
 * for a client-built CSV string, generalized here for a Blob that was
 * actually fetched from the server (a report export) instead of built
 * in-browser.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
