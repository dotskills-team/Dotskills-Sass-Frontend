"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface RoleChecklistItem {
  code: string;
  name: string;
}

interface RoleChecklistProps<T extends RoleChecklistItem> {
  roles: T[];
  value: string[];
  onChange: (next: string[]) => void;
}

/**
 * Role assign করার জন্য reusable checklist — `roleCodes: string[]` DTO shape-এ match করে।
 * Company RBAC এবং Platform Staff/Roles দুটো feature-ই এই একই generic component reuse করে।
 */
export function RoleChecklist<T extends RoleChecklistItem>({ roles, value, onChange }: RoleChecklistProps<T>) {
  function toggle(code: string, checked: boolean) {
    onChange(checked ? [...value, code] : value.filter((c) => c !== code));
  }

  return (
    <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border border-border p-3">
      {roles.map((role) => (
        <label key={role.code} className="flex items-start gap-2 text-sm">
          <Checkbox checked={value.includes(role.code)} onCheckedChange={(checked) => toggle(role.code, checked === true)} />
          <span>
            <Label className="font-normal">{role.name}</Label>
            <span className="block text-xs text-muted-foreground">{role.code}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
