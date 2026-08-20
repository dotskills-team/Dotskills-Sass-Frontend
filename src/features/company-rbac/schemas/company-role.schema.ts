import { z } from "zod";

/** Backend `CreateCompanyRoleDto`/`UpdateCompanyRoleDto` (company-rbac/dto/company-rbac.dto.ts) exactly mirror করে। */
export interface CompanyRoleFormMessages {
  codeRequired: string;
  codeLength: string;
  nameRequired: string;
  nameLength: string;
  descriptionLength: string;
}

export function createCompanyRoleSchema(messages: CompanyRoleFormMessages) {
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

export type CompanyRoleFormValues = z.infer<ReturnType<typeof createCompanyRoleSchema>>;
