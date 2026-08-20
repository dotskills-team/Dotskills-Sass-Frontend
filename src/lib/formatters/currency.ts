/**
 * Display formatting only — amount কখনো frontend calculate করে না, শুধু
 * backend response-এর amount+currencyCode format করে দেখায় (section 30)।
 */
export function formatCurrency(amount: string | number, currencyCode: string): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;

  if (Number.isNaN(numeric)) return `${amount} ${currencyCode}`;

  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(numeric);
  } catch {
    // অপরিচিত/unsupported currency code হলে graceful fallback।
    return `${numeric.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;
  }
}
