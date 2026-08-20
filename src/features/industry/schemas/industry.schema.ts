import { z } from "zod";

/**
 * ক্লায়েন্ট-side validation শুধু UX-এর জন্য — backend
 * (CreateIndustryDto/UpdateIndustryDto: `code` 2–50 chars
 * `^[A-Z0-9_-]+$`, `name` 2–120 chars, `description` optional 0–2000
 * chars) সবসময় authoritative। এই স্কিমা backend-এর নিয়ম exactly mirror
 * করে (verified against industry-management/dto/*.ts), invent করা হয়নি।
 *
 * Zod v4 error-message syntax: `{ error: "..." }` object — login.schema.ts-এ
 * established convention অনুসরণ করা হয়েছে।
 */
export interface IndustryFormMessages {
  codeRequired: string;
  codeLength: string;
  codePattern: string;
  nameRequired: string;
  nameLength: string;
  descriptionLength: string;
}

export function createIndustrySchema(messages: IndustryFormMessages) {
  return z.object({
    code: z
      .string({ error: messages.codeRequired })
      .min(1, { error: messages.codeRequired })
      .min(2, { error: messages.codeLength })
      .max(50, { error: messages.codeLength })
      .regex(/^[A-Z0-9_-]+$/, { error: messages.codePattern }),
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
  });
}

export type IndustryFormValues = z.infer<ReturnType<typeof createIndustrySchema>>;
