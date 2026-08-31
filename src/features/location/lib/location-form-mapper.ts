import type { LocationFormValues } from "@/features/location/schemas/location.schema";

export interface LocationMutationPayload {
  name: string;
  locationType?: "BRANCH" | "WAREHOUSE";
  address?: string;
  isSalesEnabled?: boolean;
}

export function toLocationPayload(values: LocationFormValues): LocationMutationPayload {
  return {
    name: values.name.trim(),
    locationType: values.locationType,
    address: values.address?.trim() || undefined,
    isSalesEnabled: values.isSalesEnabled,
  };
}
