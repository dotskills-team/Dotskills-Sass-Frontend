/** Mirrors backend `src/modules/setup-status/setup-status.types.ts` exactly — no field invented here. */
export type SetupCheckKey = "SUBSCRIPTION" | "RBAC" | "LOCATION" | "UNIT" | "PRODUCT";

export interface SetupCheckItem {
  key: SetupCheckKey;
  label: string;
  completed: boolean;
}

export interface SetupStatusData {
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  checks: SetupCheckItem[];
}
