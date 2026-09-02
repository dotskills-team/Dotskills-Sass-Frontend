"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useReplaceCompanyMemberLocationsMutation } from "@/features/company-rbac/api/company-rbac.api";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanyMember } from "@/types/company-rbac";

interface AssignMemberLocationsDialogProps {
  companyId: string;
  member: CompanyMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Real Location checklist, replacing the unusable free-text scope-key input
 * (`AssignMemberScopesDialog`) for the Location-Based Access Control
 * purpose — see the LBAC plan's own reasoning for why `CompanyMemberScope`
 * wasn't reused: no real FK to Location, and every existing member already
 * carries an unconditional catch-all scope row. An empty selection is a
 * valid, real state (revokes all Location access for this member), never
 * blocked client-side.
 */
export function AssignMemberLocationsDialog({
  companyId,
  member,
  open,
  onOpenChange,
}: AssignMemberLocationsDialogProps) {
  const t = useTranslations("companyRbac");
  const tCommon = useTranslations("common");
  const { data: locations, isLoading: isLoadingLocations } = useListLocationsQuery(companyId);
  const [replaceLocations, { isLoading: isSaving }] = useReplaceCompanyMemberLocationsMutation();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(member.locations.map((entry) => entry.locationId)),
  );

  function toggle(locationId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(locationId);
      else next.delete(locationId);
      return next;
    });
  }

  async function handleSubmit() {
    const result = await replaceLocations({
      companyId,
      memberId: member.id,
      locationIds: [...selectedIds],
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("members.actions.assignLocationsSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("members.actions.assignLocationsTitle")}</DialogTitle>
          <DialogDescription>
            {t("members.actions.assignLocationsDescription", { name: member.user.fullName })}
          </DialogDescription>
        </DialogHeader>

        {isLoadingLocations ? (
          <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
        ) : !locations || locations.length === 0 ? (
          <EmptyState title={t("members.form.noLocations")} />
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center gap-2 rounded-md border p-2">
                <Checkbox
                  id={`location-${location.id}`}
                  checked={selectedIds.has(location.id)}
                  onCheckedChange={(checked) => toggle(location.id, checked === true)}
                />
                <Label htmlFor={`location-${location.id}`} className="flex-1 cursor-pointer font-normal">
                  {location.name}
                </Label>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || isLoadingLocations}>
            {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
