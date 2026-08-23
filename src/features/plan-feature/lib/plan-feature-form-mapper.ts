import type { FeatureConfigField } from "@/types/platform";

export type LimitValueType = "string" | "number" | "boolean";

export interface LimitRow {
  key: string;
  type: LimitValueType;
  value: string;
}

export interface AssignPlanFeaturePayload {
  featureId: string;
  enabled: boolean;
  limits?: Record<string, unknown>;
}

export interface UpdatePlanFeaturePayload {
  enabled: boolean;
  limits?: Record<string, unknown>;
}

/**
 * Backend `limits` সম্পূর্ণ generic `Record<string, unknown>` (verified `AssignPlanFeatureDto`/
 * `UpdatePlanFeatureDto` — শুধু `@IsObject()`, কোনো fixed key/shape নেই), তাই এখানে কোনো নির্দিষ্ট
 * field (যেমন `maxUsers`) invent করা হয়নি — একটা generic key/type/value row editor, backend-এর
 * exact contract অনুযায়ী।
 */

/** Existing `limits` object → editable row list, Edit dialog pre-populate করার জন্য। */
export function limitsToRows(limits: Record<string, unknown> | null | undefined): LimitRow[] {
  if (!limits) return [];

  return Object.entries(limits).map(([key, value]) => {
    if (typeof value === "number") return { key, type: "number", value: String(value) };
    if (typeof value === "boolean") return { key, type: "boolean", value: String(value) };
    return { key, type: "string", value: typeof value === "string" ? value : JSON.stringify(value) };
  });
}

/** Row list → backend-এর `Record<string, unknown>` shape। খালি key বাদ, type অনুযায়ী value coerce করা হয়। */
export function rowsToLimits(rows: LimitRow[]): Record<string, unknown> | undefined {
  const entries = rows.map((row) => ({ ...row, key: row.key.trim() })).filter((row) => row.key.length > 0);

  if (entries.length === 0) return undefined;

  const result: Record<string, unknown> = {};
  for (const row of entries) {
    if (row.type === "number") {
      const num = Number(row.value);
      result[row.key] = Number.isNaN(num) ? 0 : num;
    } else if (row.type === "boolean") {
      result[row.key] = row.value === "true";
    } else {
      result[row.key] = row.value;
    }
  }
  return result;
}

/**
 * Feature-এর `configSchema` থাকলে (verified `Feature.configSchema Json?`) admin-friendly
 * dynamic form ব্যবহার হয় — `LimitRow`-এর মতো raw key/type/value নয়। `FeatureConfigForm`-এর
 * value object সরাসরি backend contract-এর type-এ থাকে (number/boolean/string/string[]),
 * তাই কোনো string→type coercion লাগে না।
 */
export function buildConfigDefaults(schema: FeatureConfigField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of schema) {
    if (field.defaultValue !== undefined) {
      result[field.key] = field.defaultValue;
    } else if (field.type === "MULTI_SELECT") {
      result[field.key] = [];
    }
  }
  return result;
}

/** Existing `limits` → dynamic form initial values (Edit dialog pre-populate), missing keys backfilled from schema defaults. */
export function limitsToConfigValues(
  schema: FeatureConfigField[],
  limits: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  return { ...buildConfigDefaults(schema), ...(limits ?? {}) };
}

/** Table-এ raw JSON না দেখিয়ে human-friendly summary — schema থাকলে field label + option label ব্যবহার করে, না থাকলে key: value fallback। */
export function formatLimitsSummary(
  limits: Record<string, unknown> | null | undefined,
  schema: FeatureConfigField[] | null,
  booleanLabels: { yes: string; no: string },
): string | null {
  if (!limits || Object.keys(limits).length === 0) return null;

  const formatValue = (value: unknown): string =>
    typeof value === "boolean" ? (value ? booleanLabels.yes : booleanLabels.no) : String(value);

  if (!schema || schema.length === 0) {
    return Object.entries(limits)
      .map(([key, value]) => `${key}: ${formatValue(value)}`)
      .join(", ");
  }

  const parts: string[] = [];
  for (const field of schema) {
    const value = limits[field.key];
    if (value === undefined || value === null) continue;

    if (field.type === "SELECT") {
      const option = field.options?.find((o) => o.value === value);
      parts.push(`${field.label}: ${option?.label ?? String(value)}`);
    } else if (field.type === "MULTI_SELECT" && Array.isArray(value)) {
      const labels = value.map((v) => field.options?.find((o) => o.value === v)?.label ?? String(v));
      parts.push(`${field.label}: ${labels.join(", ")}`);
    } else {
      parts.push(`${field.label}: ${formatValue(value)}`);
    }
  }
  return parts.length > 0 ? parts.join(" • ") : null;
}

export function toAssignPlanFeaturePayload(
  featureId: string,
  enabled: boolean,
  limits: Record<string, unknown> | undefined,
): AssignPlanFeaturePayload {
  return { featureId, enabled, limits };
}

export function toUpdatePlanFeaturePayload(
  enabled: boolean,
  limits: Record<string, unknown> | undefined,
): UpdatePlanFeaturePayload {
  return { enabled, limits };
}
