import { z } from "zod";

/**
 * Backend `CreateUnitDto`/`UpdateUnitDto` mirrored exactly (verified
 * unit/dto/unit.dto.ts): name 1-60 chars, code 1-20 chars (immutable after
 * creation, matching Industry's own code-immutable convention), optional
 * baseUnitId (uuid), optional conversionFactor (>0, max 4 decimal places).
 */
export interface UnitFormMessages {
  nameRequired: string;
  nameLength: string;
  codeRequired: string;
  codeLength: string;
  conversionFactorPositive: string;
}

export function createUnitSchema(messages: UnitFormMessages) {
  return z.object({
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .max(60, { error: messages.nameLength }),
    code: z
      .string({ error: messages.codeRequired })
      .min(1, { error: messages.codeRequired })
      .max(20, { error: messages.codeLength }),
    baseUnitId: z.string().optional().or(z.literal("")),
    conversionFactor: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) => !value || (Number(value) > 0 && Number.isFinite(Number(value))),
        { error: messages.conversionFactorPositive },
      ),
  });
}

export type UnitFormValues = z.infer<ReturnType<typeof createUnitSchema>>;
