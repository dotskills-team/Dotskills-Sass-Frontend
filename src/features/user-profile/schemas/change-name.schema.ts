import { z } from "zod";

export interface ChangeNameFormMessages {
  nameRequired: string;
  nameLength: string;
}

export function createChangeNameSchema(messages: ChangeNameFormMessages) {
  return z.object({
    fullName: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(160, { error: messages.nameLength }),
  });
}

export type ChangeNameFormValues = z.infer<ReturnType<typeof createChangeNameSchema>>;
