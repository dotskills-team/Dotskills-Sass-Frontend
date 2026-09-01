/**
 * The backend has no `{errorCode, userMessage:{en,bn}}` shape (verified —
 * see Frontend Phase 2 plan, Gap 3) — every error is a plain English
 * sentence. This is a small, additive, frontend-only pattern-matching
 * layer for THIS phase's known Purchase/Transfer business-rule errors
 * (every message enumerated by direct read of purchase-order.service.ts /
 * stock-transfer.service.ts / supplier-payment.service.ts, not guessed).
 * Never used as the only path: callers always fall back to
 * `normalizeApiError(error).message` (the existing, already-used
 * normalizer, untouched) when a message isn't recognized here — an
 * unrecognized error still surfaces, just in English, never hidden.
 */

interface ErrorRule {
  pattern: RegExp;
  bn: (match: RegExpMatchArray) => string;
  en: (match: RegExpMatchArray) => string;
}

const RULES: ErrorRule[] = [
  {
    pattern: /^INSUFFICIENT_STOCK$/,
    bn: () => "পর্যাপ্ত স্টক নেই এই লোকেশনে।",
    en: () => "Not enough stock at this location.",
  },
  {
    pattern: /^INSUFFICIENT_STOCK: not enough stock for one or more items in this sale/,
    bn: () => "একটা বা একাধিক আইটেমের জন্য পর্যাপ্ত স্টক নেই।",
    en: () => "Not enough stock for one or more items in this sale.",
  },
  {
    pattern: /^INSUFFICIENT_STOCK:/,
    bn: () => "এই পণ্যের ফেরত দেওয়ার মতো পর্যাপ্ত স্টক নেই।",
    en: () => "Not enough stock of this product to return.",
  },
  {
    pattern: /^A customerId is required when any payment uses the DUE method/,
    bn: () => "বাকি (Due) পেমেন্ট দিতে হলে একজন কাস্টমার বেছে নিতে হবে।",
    en: () => "Select a customer before using the Due payment method.",
  },
  {
    pattern: /^Sum of payments \(([\d.]+)\) must equal the computed total \(([\d.]+)\)/,
    bn: () => "পেমেন্টের যোগফল মোট বিলের সাথে মিলছে না।",
    en: () => "Payment total doesn't match the bill total.",
  },
  {
    pattern: /^productId .+ does not belong to this company/,
    bn: () => "এই পণ্যটি খুঁজে পাওয়া যায়নি।",
    en: () => "One of the selected products wasn't found.",
  },
  {
    pattern: /^Sale cannot be voided from (\w+) state/,
    bn: (m) => `এই অবস্থা (${m[1]}) থেকে Void করা যাবে না।`,
    en: (m) => `Can't void a sale in ${m[1]} state.`,
  },
  {
    pattern: /^Cannot return items for a sale in (\w+) state/,
    bn: (m) => `এই অবস্থার (${m[1]}) বিক্রয়ে রিটার্ন নেওয়া যাবে না।`,
    en: (m) => `Can't return items for a sale in ${m[1]} state.`,
  },
  {
    pattern: /^productId .+ was not part of this sale/,
    bn: () => "এই পণ্যটি এই বিক্রয়ের অংশ ছিল না।",
    en: () => "That product wasn't part of this sale.",
  },
  {
    pattern: /^Cannot receive more than ordered for product .+ \(ordered ([\d.]+), already received ([\d.]+)\)/,
    bn: (m) => `অর্ডারের চেয়ে বেশি রিসিভ করা যাবে না (অর্ডার করা হয়েছে ${m[1]}, ইতিমধ্যে এসেছে ${m[2]})।`,
    en: (m) => `Can't receive more than ordered (ordered ${m[1]}, already received ${m[2]}).`,
  },
  {
    pattern: /^Only a DRAFT purchase order can be edited/,
    bn: () => "শুধু DRAFT অবস্থায় থাকা অর্ডার এডিট করা যাবে — মাল আসার পর এটা আর বদলানো যাবে না, এর বদলে Purchase Return ব্যবহার করুন।",
    en: () => "Only a DRAFT order can be edited — once goods arrive it's locked; use a Purchase Return instead.",
  },
  {
    pattern: /^Only a DRAFT purchase order can be cancelled/,
    bn: () => "শুধু DRAFT অবস্থায় থাকা অর্ডার বাতিল করা যাবে।",
    en: () => "Only a DRAFT order can be cancelled.",
  },
  {
    pattern: /^Cannot receive goods against a cancelled purchase order/,
    bn: () => "বাতিল হওয়া অর্ডারে মাল রিসিভ করা যাবে না।",
    en: () => "Can't receive goods against a cancelled order.",
  },
  {
    pattern: /^Cannot return goods for a purchase order that has never been received/,
    bn: () => "যে অর্ডারে এখনো কিছু আসেনি, সেখানে ফেরত দেওয়া যাবে না।",
    en: () => "Can't return goods for an order that's never received anything.",
  },
  {
    pattern: /^Transfer cannot be dispatched from (\w+) state/,
    bn: (m) => `এই অবস্থা (${m[1]}) থেকে ডিসপ্যাচ করা যাবে না।`,
    en: (m) => `Can't dispatch from ${m[1]} state.`,
  },
  {
    pattern: /^Transfer cannot be received from (\w+) state/,
    bn: (m) => `এই অবস্থা (${m[1]}) থেকে রিসিভ করা যাবে না।`,
    en: (m) => `Can't receive from ${m[1]} state.`,
  },
  {
    pattern: /^fromLocationId and toLocationId must be different locations/,
    bn: () => "উৎস ও গন্তব্য লোকেশন একই হতে পারবে না।",
    en: () => "Source and destination location can't be the same.",
  },
  {
    pattern: /^An open cash drawer session already exists for this cashier/,
    bn: () => "আপনার ইতিমধ্যে একটা সেশন চলমান আছে — নতুন সেশন খোলার আগে সেটা বন্ধ করুন।",
    en: () => "You already have a session open — close it before opening a new one.",
  },
  {
    pattern: /^locationId does not belong to this company/,
    bn: () => "এই লোকেশনটা খুঁজে পাওয়া যায়নি।",
    en: () => "This location wasn't found.",
  },
  {
    pattern: /^openingBalance is required for this cashier's first session at this location/,
    bn: () => "এই লোকেশনে আপনার প্রথম সেশন — শুরুর ব্যালেন্স লিখুন।",
    en: () => "This is your first session at this location — enter a starting balance.",
  },
  {
    pattern: /^Cannot close a session with status (\w+)/,
    bn: (m) => `এই অবস্থার (${m[1]}) সেশন বন্ধ করা যাবে না।`,
    en: (m) => `Can't close a session in ${m[1]} state.`,
  },
  {
    pattern: /^(Purchase order|Stock transfer|Supplier|Sale|Cash drawer session) was not found/,
    bn: () => "এই তথ্য খুঁজে পাওয়া যায়নি।",
    en: () => "This record wasn't found.",
  },
];

/** Returns a friendly bn/en message for a known backend error, or `null` if unrecognized (caller should fall back to the raw message). */
export function translateBusinessError(rawMessage: string, locale: string): string | null {
  for (const rule of RULES) {
    const match = rawMessage.match(rule.pattern);
    if (match) {
      return locale === "bn" ? rule.bn(match) : rule.en(match);
    }
  }
  return null;
}

/**
 * `normalizeApiError(error).message` (the existing, already-used
 * normalizer) first, then tries the translation table on that message —
 * the one function this phase's screens call for every mutation error.
 */
export function resolveBusinessErrorMessage(
  normalizedMessage: string,
  locale: string,
): string {
  return translateBusinessError(normalizedMessage, locale) ?? normalizedMessage;
}
