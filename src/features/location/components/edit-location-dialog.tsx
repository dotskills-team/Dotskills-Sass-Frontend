"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LocationForm } from "@/features/location/components/location-form";
import { useUpdateLocationMutation } from "@/features/location/api/location.api";
import { toLocationPayload } from "@/features/location/lib/location-form-mapper";
import { normalizeApiError } from "@/lib/api-error";
import type { LocationFormValues } from "@/features/location/schemas/location.schema";
import type { Location } from "@/types/location";

interface EditLocationDialogProps {
  companyId: string;
  location: Location;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLocationDialog({ companyId, location, open, onOpenChange }: EditLocationDialogProps) {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const [updateLocation, { isLoading }] = useUpdateLocationMutation();

  async function handleSubmit(values: LocationFormValues) {
    const payload = toLocationPayload(values);
    const result = await updateLocation({
      companyId,
      id: location.id,
      body: { name: payload.name, address: payload.address, isSalesEnabled: payload.isSalesEnabled },
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.editSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.editTitle")}</DialogTitle>
          <DialogDescription>{t("form.editDescription", { name: location.name })}</DialogDescription>
        </DialogHeader>
        <LocationForm
          defaultValues={{
            name: location.name,
            locationType: location.locationType,
            address: location.address ?? "",
            isSalesEnabled: location.isSalesEnabled,
          }}
          isTypeEditable={false}
          isSubmitting={isLoading}
          submitLabel={tCommon("update")}
          cancelLabel={tCommon("cancel")}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
