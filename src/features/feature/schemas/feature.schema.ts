import { z } from "zod";

/**
 * Backend (`CreateFeatureDto`/`UpdateFeatureDto`: `name` 2–120 chars,
 * `code` 2–80 chars, `module` 2–80 chars, `description` optional
 * ≤5000 chars — verified against features-list/dto/*.ts) সবসময়
 * authoritative। এই স্কিমা সেই নিয়ম exactly mirror করে।
 */
export interface FeatureFormMessages {
  nameRequired: string;
  nameLength: string;
  codeRequired: string;
  codeLength: string;
  moduleRequired: string;
  moduleLength: string;
  descriptionLength: string;
}

export function createFeatureSchema(messages: FeatureFormMessages) {
  return z.object({
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(120, { error: messages.nameLength }),
    code: z
      .string({ error: messages.codeRequired })
      .min(1, { error: messages.codeRequired })
      .min(2, { error: messages.codeLength })
      .max(80, { error: messages.codeLength }),
    module: z
      .string({ error: messages.moduleRequired })
      .min(1, { error: messages.moduleRequired })
      .min(2, { error: messages.moduleLength })
      .max(80, { error: messages.moduleLength }),
    description: z
      .string()
      .max(5000, { error: messages.descriptionLength })
      .optional()
      .or(z.literal("")),
  });
}

export type FeatureFormValues = z.infer<ReturnType<typeof createFeatureSchema>>;
