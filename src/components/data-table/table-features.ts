import { tableFeatures } from "@tanstack/react-table";

/**
 * TanStack Table v9 (bleeding-edge, installed here as ^9.1.2 — confirmed
 * via the package's own bundled migration docs, a genuinely different
 * API from the widely-known v8) requires explicit feature registration.
 * এই app-এর সব table server-side sort/filter/paginate করে (query params
 * দিয়ে), তাই client-side কোনো feature (sorting/filtering/pagination row
 * model) দরকার নেই — শুধু default core row model, যেটা automatic।
 * একটাই shared instance/type সব table+column-def file-এ ব্যবহার হয়,
 * যাতে generic টাইপ সব জায়গায় মেলে।
 */
export const appTableFeatures = tableFeatures({});
export type AppTableFeatures = typeof appTableFeatures;
