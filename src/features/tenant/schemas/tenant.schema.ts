import { z } from "zod";

/**
 * Backend's `CreateTenantDto`/`UpdateTenantDto` (tenant-management/dto/*.ts) accept
 * only `name` — `code` and `slug` are always system-generated, never user input.
 */
export interface TenantFormMessages {
  nameRequired: string;
  nameLength: string;
}

export function createTenantSchema(messages: TenantFormMessages) {
  return z.object({
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(160, { error: messages.nameLength }),
  });
}

export type TenantFormValues = z.infer<ReturnType<typeof createTenantSchema>>;
