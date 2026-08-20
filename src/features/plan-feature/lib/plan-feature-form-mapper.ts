export type ParsedLimits =
  | { ok: true; value: Record<string, unknown> | undefined }
  | { ok: false };

/** `limits` is a free-form JSON textarea (backend: `Record<string, unknown>`, no fixed shape) — parsed here, not invented. */
export function parseLimitsJson(input: string): ParsedLimits {
  if (!input.trim()) {
    return { ok: true, value: undefined };
  }

  try {
    return { ok: true, value: JSON.parse(input) as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
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

export function toAssignPlanFeaturePayload(
  values: Record<string, string>,
  limits: Record<string, unknown> | undefined,
): AssignPlanFeaturePayload {
  return { featureId: values.featureId, enabled: values.enabled === "true", limits };
}

export function toUpdatePlanFeaturePayload(
  values: Record<string, string>,
  limits: Record<string, unknown> | undefined,
): UpdatePlanFeaturePayload {
  return { enabled: values.enabled === "true", limits };
}
