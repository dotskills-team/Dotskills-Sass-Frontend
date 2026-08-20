import { z } from "zod";

/**
 * Backend (`CreatePlanPriceDto`/`UpdatePlanPriceDto`, verified against
 * plan-pricing/dto/*.ts): `billingCycle` (MONTHLY/YEARLY) ও
 * `currencyCode` শুধু CREATE-এ পাঠানো যায় — `UpdatePlanPriceDto`-তে এই
 * দুটো field-ই নেই, অর্থাৎ backend-এ এগুলো immutable। তাই Edit form
 * এই দুটো field দেখায় না (rule: "Backend যেসব field update করতে দেয়
 * শুধু সেগুলোই editable")। `amount` max ৪ decimal place, ঋণাত্মক নয়।
 * `currencyCode` না দিলে backend default `BDT` বসায় (verified,
 * plan-pricing.service.ts) — frontend সেই default invent করে না,
 * শুধু placeholder-এ জানায়।
 */
export interface PlanPriceFormMessages {
  billingCycleRequired: string;
  currencyCodePattern: string;
  amountRequired: string;
  amountInvalid: string;
  effectiveToBeforeFrom: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,4})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function amountField(messages: PlanPriceFormMessages) {
  return z
    .string({ error: messages.amountRequired })
    .min(1, { error: messages.amountRequired })
    .regex(AMOUNT_PATTERN, { error: messages.amountInvalid });
}

function dateRangeCheck(
  data: { effectiveFrom?: string; effectiveTo?: string },
  ctx: z.RefinementCtx,
  message: string,
) {
  if (data.effectiveFrom && data.effectiveTo && data.effectiveTo <= data.effectiveFrom) {
    ctx.addIssue({ code: "custom", message, path: ["effectiveTo"] });
  }
}

export function createPlanPriceCreateSchema(messages: PlanPriceFormMessages) {
  return z
    .object({
      billingCycle: z.enum(["MONTHLY", "YEARLY"], { error: messages.billingCycleRequired }),
      currencyCode: z
        .string()
        .regex(CURRENCY_PATTERN, { error: messages.currencyCodePattern })
        .optional()
        .or(z.literal("")),
      amount: amountField(messages),
      effectiveFrom: z.string().optional().or(z.literal("")),
      effectiveTo: z.string().optional().or(z.literal("")),
      isActive: z.enum(["true", "false"]),
    })
    .superRefine((data, ctx) => dateRangeCheck(data, ctx, messages.effectiveToBeforeFrom));
}

export function createPlanPriceEditSchema(messages: PlanPriceFormMessages) {
  return z
    .object({
      amount: amountField(messages),
      effectiveFrom: z.string().optional().or(z.literal("")),
      effectiveTo: z.string().optional().or(z.literal("")),
      isActive: z.enum(["true", "false"]),
    })
    .superRefine((data, ctx) => dateRangeCheck(data, ctx, messages.effectiveToBeforeFrom));
}

export type PlanPriceCreateFormValues = z.infer<ReturnType<typeof createPlanPriceCreateSchema>>;
export type PlanPriceEditFormValues = z.infer<ReturnType<typeof createPlanPriceEditSchema>>;
