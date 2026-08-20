/**
 * Backend-এর ৩টা list endpoint-এ ৩টা আলাদা envelope shape আছে
 * (`{items,meta}`, `{data,meta}`, `{success,message,data,meta}`) এবং
 * Subscriptions-এ কোনো envelope/pagination-ই নেই (raw array, capped)।
 * এই ভিন্নতা backend-এই verify করা হয়েছে, invent করা হয়নি।
 *
 * Frontend-এ প্রতিটা `transformResponse`-এ এই একটা common shape-এ
 * normalize করা হয়, যাতে DataTable/pagination component একটাই থাকতে
 * পারে — এটা presentation-layer adaptation, backend data পরিবর্তন নয়।
 */
export interface ListResult<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number } | null;
}

type ListMeta = NonNullable<ListResult<unknown>["meta"]>;

/** `{ items, meta }` envelope (Companies, Billing, Invoices, Payments)। */
export function normalizeItemsEnvelope<T>(response: { items: T[]; meta: ListMeta }): ListResult<T> {
  return { items: response.items, meta: response.meta };
}

/** `{ data, meta }` envelope (Industries)। */
export function normalizeDataEnvelope<T>(response: { data: T[]; meta: ListMeta }): ListResult<T> {
  return { items: response.data, meta: response.meta };
}

/** `{ success, message, data, meta }` envelope (Plans)। */
export function normalizeSuccessEnvelope<T>(response: {
  data: T[];
  meta: ListMeta;
}): ListResult<T> {
  return { items: response.data, meta: response.meta };
}

/** Envelope/pagination-বিহীন raw array (Subscriptions — backend সমর্থন করে না)। */
export function normalizeRawArray<T>(response: T[]): ListResult<T> {
  return { items: response, meta: null };
}
