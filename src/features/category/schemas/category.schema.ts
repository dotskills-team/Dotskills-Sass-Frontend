import { z } from "zod";

/** Backend `CreateCategoryDto`/`UpdateCategoryDto` mirrored exactly (verified category/dto/category.dto.ts): name 2-120 chars, optional parentCategoryId (uuid). */
export interface CategoryFormMessages {
  nameRequired: string;
  nameLength: string;
}

export function createCategorySchema(messages: CategoryFormMessages) {
  return z.object({
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(120, { error: messages.nameLength }),
    parentCategoryId: z.string().optional().or(z.literal("")),
  });
}

export type CategoryFormValues = z.infer<ReturnType<typeof createCategorySchema>>;
