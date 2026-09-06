"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

import { useUploadCompanyLogoMutation } from "@/features/company-settings/api/company-settings.api";
import { validateLogoFile } from "@/features/company-settings/lib/company-logo-validation";
import { normalizeApiError } from "@/lib/api-error";

/**
 * Standalone action, deliberately not part of `CompanySettingsForm`'s
 * react-hook-form state — uploads immediately on file selection rather
 * than waiting for that form's own "Save changes" button, since a logo
 * change has nothing to do with the toggle/threshold fields on that form.
 * Server always re-validates type/size too (`company-settings.controller.ts`'s
 * `ParseFilePipeBuilder` + `CompanySettingsService.uploadLogo()`) — this
 * client-side check is purely to fail fast with a clear message, never the
 * only gate.
 */
export function CompanyLogoUpload({
  companyId,
  logoUrl,
  companyName,
}: {
  companyId: string;
  logoUrl: string | null;
  companyName: string;
}) {
  const t = useTranslations("settings");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadLogo, { isLoading }] = useUploadCompanyLogoMutation();

  function resetInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateLogoFile(file);
    if (validationError) {
      toast.error(t(`logo.${validationError}`));
      resetInput();
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    void handleUpload(file);
  }

  async function handleUpload(file: File) {
    const result = await uploadLogo({ companyId, file });
    resetInput();

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      setPreviewUrl(null);
      return;
    }
    toast.success(t("logo.uploadSuccess"));
    setPreviewUrl(null);
  }

  const initial = (companyName.trim()[0] ?? "?").toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("logo.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={previewUrl ?? logoUrl ?? undefined} alt={companyName} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <CompanyPermissionGate
              permission={COMPANY_PERMISSIONS.SETTINGS_UPDATE}
              fallback={<p className="text-sm text-muted-foreground">{t("logo.help")}</p>}
            >
              <label htmlFor="company-logo-file" className="text-sm font-medium">
                {t("logo.uploadLabel")}
              </label>
              <input
                id="company-logo-file"
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileSelected}
                disabled={isLoading}
                className="block w-full rounded-md border border-input px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
              <p className="text-sm text-muted-foreground">{t("logo.help")}</p>
            </CompanyPermissionGate>
          </div>

          {isLoading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />}
        </div>
      </CardContent>
    </Card>
  );
}
