"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface PermissionChecklistItem {
  code: string;
  moduleCode: string;
  name: string;
}

interface PermissionChecklistProps<T extends PermissionChecklistItem> {
  permissions: T[];
  value: string[];
  onChange: (next: string[]) => void;
}

/**
 * `moduleCode` অনুযায়ী group করে দেখানো — backend `permission-catalog.ts`-এর নিজস্ব grouping-ই
 * source of truth। Company RBAC (`company-rbac`) এবং Platform Roles (`platform-roles`) দুটো
 * feature-ই এই একই generic component reuse করে — permission শুধু `{code, moduleCode, name}`
 * shape মানলেই চলে, feature-specific কোনো coupling নেই।
 */
export function PermissionChecklist<T extends PermissionChecklistItem>({
  permissions,
  value,
  onChange,
}: PermissionChecklistProps<T>) {
  const grouped = new Map<string, T[]>();
  for (const permission of permissions) {
    const list = grouped.get(permission.moduleCode) ?? [];
    list.push(permission);
    grouped.set(permission.moduleCode, list);
  }

  function toggle(code: string, checked: boolean) {
    onChange(checked ? [...value, code] : value.filter((c) => c !== code));
  }

  return (
    <div className="max-h-80 space-y-4 overflow-y-auto rounded-md border border-border p-3">
      {[...grouped.entries()].map(([moduleCode, items]) => (
        <div key={moduleCode}>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{moduleCode}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((permission) => (
              <label key={permission.code} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={value.includes(permission.code)}
                  onCheckedChange={(checked) => toggle(permission.code, checked === true)}
                />
                <span>
                  <Label className="font-normal">{permission.name}</Label>
                  <span className="block text-xs text-muted-foreground">{permission.code}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
