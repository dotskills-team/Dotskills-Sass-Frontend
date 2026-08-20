import type {
  PlanPriceCreateFormValues,
  PlanPriceEditFormValues,
} from "@/features/plan-price/schemas/plan-price.schema";

export function toCreatePlanPricePayload(values: PlanPriceCreateFormValues) {
  return {
    billingCycle: values.billingCycle,
    currencyCode: values.currencyCode?.trim() || undefined,
    amount: Number(values.amount),
    effectiveFrom: values.effectiveFrom || undefined,
    effectiveTo: values.effectiveTo || undefined,
    isActive: values.isActive === "true",
  };
}

export function toUpdatePlanPricePayload(values: PlanPriceEditFormValues) {
  return {
    amount: Number(values.amount),
    effectiveFrom: values.effectiveFrom || undefined,
    effectiveTo: values.effectiveTo || undefined,
    isActive: values.isActive === "true",
  };
}
