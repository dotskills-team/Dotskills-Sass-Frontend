import { z } from "zod";

/**
 * Backend (`CreatePlanDto`/`UpdatePlanDto`: `code` 2–50 chars, `name`
 * 2–120 chars, `description` optional ≤2000 chars, `trialDays`
 * optional int 0–365, `isPublic` optional boolean — verified against
 * plan/dto/*.ts) সবসময় authoritative। এই স্কিমা সেই নিয়ম exactly
 * mirror করে। `code`-এ backend কোনো regex enforce করে না (শুধু
 * length), তাই এখানেও pattern invent করা হয়নি।
 */
export interface PlanFormMessages {
  codeRequired: string;
  codeLength: string;
  nameRequired: string;
  nameLength: string;
  descriptionLength: string;
  trialDaysRange: string;
}

export function createPlanSchema(messages: PlanFormMessages) {
  return z.object({
    code: z
      .string({ error: messages.codeRequired })
      .min(1, { error: messages.codeRequired })
      .min(2, { error: messages.codeLength })
      .max(50, { error: messages.codeLength }),
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(120, { error: messages.nameLength }),
    description: z
      .string()
      .max(2000, { error: messages.descriptionLength })
      .optional()
      .or(z.literal("")),
    trialDays: z
      .string()
      .refine((value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 365), {
        error: messages.trialDaysRange,
      }),
    isPublic: z.enum(["true", "false"]),
  });
}

export type PlanFormValues = z.infer<ReturnType<typeof createPlanSchema>>;
