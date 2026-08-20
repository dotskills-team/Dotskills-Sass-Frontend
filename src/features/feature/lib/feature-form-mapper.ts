import type { FeatureFormValues } from "@/features/feature/schemas/feature.schema";

export interface FeatureMutationPayload {
  name: string;
  code: string;
  module: string;
  description?: string;
}

/** Form values → backend mutation body — create ও update একই shape নেয়। */
export function toFeaturePayload(values: FeatureFormValues): FeatureMutationPayload {
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    module: values.module.trim(),
    description: values.description?.trim() || undefined,
  };
}
