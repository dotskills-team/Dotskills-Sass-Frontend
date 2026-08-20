import { z } from "zod";

/**
 * Backend-এর `CreateTenantDto`/`UpdateTenantDto` (tenant-management/dto/*.ts) exactly
 * mirror করে: `code` 2–40 chars `^[A-Z0-9_-]+$`, `name` 2–160 chars, `slug` 2–120
 * chars `^[a-z0-9]+(?:-[a-z0-9]+)*$` — কোনো নিয়ম invent করা হয়নি।
 */
export interface TenantFormMessages {
  codeRequired: string;
  codeLength: string;
  codePattern: string;
  nameRequired: string;
  nameLength: string;
  slugRequired: string;
  slugLength: string;
  slugPattern: string;
}

export function createTenantSchema(messages: TenantFormMessages) {
  return z.object({
    code: z
      .string({ error: messages.codeRequired })
      .min(1, { error: messages.codeRequired })
      .min(2, { error: messages.codeLength })
      .max(40, { error: messages.codeLength })
      .regex(/^[A-Z0-9_-]+$/, { error: messages.codePattern }),
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(160, { error: messages.nameLength }),
    slug: z
      .string({ error: messages.slugRequired })
      .min(1, { error: messages.slugRequired })
      .min(2, { error: messages.slugLength })
      .max(120, { error: messages.slugLength })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: messages.slugPattern }),
  });
}

export type TenantFormValues = z.infer<ReturnType<typeof createTenantSchema>>;
