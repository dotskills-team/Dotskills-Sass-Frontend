import { z } from "zod";

/** Backend `CreateLocationDto`/`UpdateLocationDto` mirrored exactly (verified location/dto/location.dto.ts): name 2-120 chars, locationType enum (required on create), address optional max 2000. */
export interface LocationFormMessages {
  nameRequired: string;
  nameLength: string;
  locationTypeRequired: string;
}

export function createLocationSchema(messages: LocationFormMessages) {
  return z.object({
    name: z
      .string({ error: messages.nameRequired })
      .min(1, { error: messages.nameRequired })
      .min(2, { error: messages.nameLength })
      .max(120, { error: messages.nameLength }),
    locationType: z.enum(["BRANCH", "WAREHOUSE"], { error: messages.locationTypeRequired }),
    address: z.string().max(2000).optional().or(z.literal("")),
    isSalesEnabled: z.boolean(),
  });
}

export type LocationFormValues = z.infer<ReturnType<typeof createLocationSchema>>;
