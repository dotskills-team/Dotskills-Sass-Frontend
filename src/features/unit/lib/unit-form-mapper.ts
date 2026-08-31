import type { UnitFormValues } from "@/features/unit/schemas/unit.schema";

export interface UnitMutationPayload {
  name: string;
  code?: string;
  baseUnitId?: string;
  conversionFactor?: number;
}

/** Form values → backend mutation body. `code` is omitted for updates by the caller (immutable after creation). */
export function toUnitPayload(values: UnitFormValues): UnitMutationPayload {
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    baseUnitId: values.baseUnitId || undefined,
    conversionFactor: values.conversionFactor ? Number(values.conversionFactor) : undefined,
  };
}
