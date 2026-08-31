"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { LocationForm } from "@/features/location/components/location-form";
import { useCreateLocationMutation } from "@/features/location/api/location.api";
import { toLocationPayload } from "@/features/location/lib/location-form-mapper";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { LocationFormValues } from "@/features/location/schemas/location.schema";

const EMPTY_VALUES: LocationFormValues = {
  name: "",
  locationType: "BRANCH",
  address: "",
  isSalesEnabled: true,
};

export function CreateLocationDialog({ companyId }: { companyId: string }) {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createLocation, { isLoading }] = useCreateLocationMutation();

  async function handleSubmit(values: LocationFormValues) {
    const result = await createLocation({ companyId, body: toLocationPayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.LOCATION_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
        </DialogHeader>
        <LocationForm
          defaultValues={EMPTY_VALUES}
          isTypeEditable
          isSubmitting={isLoading}
          submitLabel={tCommon("create")}
          cancelLabel={tCommon("cancel")}
          onCancel={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
