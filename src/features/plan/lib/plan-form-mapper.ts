import type { PlanFormValues } from "@/features/plan/schemas/plan.schema";

export interface PlanMutationPayload {
  code: string;
  name: string;
  description?: string;
  trialDays: number;
  isPublic: boolean;
}

/** Form values → backend mutation body — create ও update একই shape নেয়। */
export function toPlanPayload(values: PlanFormValues): PlanMutationPayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    trialDays: values.trialDays === "" ? 0 : Number(values.trialDays),
    isPublic: values.isPublic === "true",
  };
}
