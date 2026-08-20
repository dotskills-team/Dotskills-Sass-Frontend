import { z } from "zod";

/** Backend `CreatePlatformRoleDto`/`UpdatePlatformRoleDto` (platform-role/dto/platform-role.dto.ts) exactly mirror করে। */
export interface PlatformRoleFormMessages {
  codeRequired: string;
  codeLength: string;
  nameRequired: string;
  nameLength: string;
  descriptionLength: string;
}

export function createPlatformRoleSchema(messages: PlatformRoleFormMessages) {
  return z.object({
    code: z
      .string({ error: messages.codeRequired })
      .min(1, { error: messages.codeRequired })
      .min(2, { error: messages.codeLength })
      .max(60, { error: messages.codeLength }),
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(120, { error: messages.nameLength }),
    description: z.string().max(1000, { error: messages.descriptionLength }).optional().or(z.literal("")),
  });
}

export type PlatformRoleFormValues = z.infer<ReturnType<typeof createPlatformRoleSchema>>;
