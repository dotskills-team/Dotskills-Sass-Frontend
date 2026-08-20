import type { IndustryFormValues } from "@/features/industry/schemas/industry.schema";

export interface IndustryMutationPayload {
  code: string;
  name: string;
  description?: string;
}

/**
 * Form values → backend mutation body। Create ও Update দুটোই একই
 * shape নেয় (`CreateIndustryDto`/`UpdateIndustryDto` field সেট identical,
 * শুধু update-এ সব optional) — তাই একটাই mapper দুই dialog-এই reuse হয়।
 * Trim/empty-to-undefined ছাড়া কোনো business decision এখানে নেই।
 */
export function toIndustryPayload(values: IndustryFormValues): IndustryMutationPayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
  };
}
