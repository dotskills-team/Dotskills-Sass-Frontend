"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { CompanyBrandMark } from "@/components/layout/company-brand-mark";

import { useUploadPlatformLogoMutation } from "@/features/platform-settings/api/platform-settings.api";
import { validateImageFile } from "@/lib/validation/image-file";
import { normalizeApiError } from "@/lib/api-error";

/**
 * Mirrors `ProfileImageUpload`'s hero-style layout (large preview + floating
 * camera button, instead of a raw `<input type="file">` row) — just for the
 * one platform-wide singleton logo. Uses `CompanyBrandMark` for the preview
 * since that's the same un-cropped, "logo at its own proportions" component
 * the sidebar/navbar already use for this exact logo.
 *
 * Permission gating is unchanged from before this visual pass — everything
 * interactive (the hidden input, both trigger buttons) still lives inside
 * `PlatformPermissionGate`, so a Platform Staff member without
 * `SETTINGS_UPDATE` still only ever sees the read-only fallback text, never
 * a way to trigger an upload.
 */
export function PlatformLogoUpload({ logoUrl }: { logoUrl: string | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadLogo, { isLoading }] = useUploadPlatformLogoMutation();

  function resetInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(
        validationError === "invalidType"
          ? "Logo must be a PNG or JPG image."
          : "Logo must be 2MB or smaller.",
      );
      resetInput();
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    void handleUpload(file);
  }

  async function handleUpload(file: File) {
    const result = await uploadLogo({ file });
    resetInput();

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      setPreviewUrl(null);
      return;
    }
    toast.success("Platform logo updated.");
    setPreviewUrl(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Logo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <PlatformPermissionGate
            permission={PLATFORM_PERMISSIONS.SETTINGS_UPDATE}
            fallback={
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border bg-muted/30 p-3 shadow-sm">
                <CompanyBrandMark logoUrl={logoUrl} name="DotSkills" />
              </div>
            }
          >
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border bg-muted/30 p-3 shadow-sm ring-4 ring-background">
                <CompanyBrandMark logoUrl={previewUrl ?? logoUrl} name="DotSkills" />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                aria-label="Change platform logo"
                className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Camera className="size-4" aria-hidden="true" />
                )}
              </button>

              <input
                id="platform-logo-file"
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileSelected}
                disabled={isLoading}
                className="sr-only"
              />
            </div>
          </PlatformPermissionGate>

          <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
            <p className="font-medium text-foreground">Platform branding</p>
            <p className="text-sm text-muted-foreground">
              Shown in the sidebar and navbar across the platform.
            </p>

            <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SETTINGS_UPDATE}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera className="size-4" aria-hidden="true" />
                Upload logo
              </Button>
              <p className="text-xs text-muted-foreground">PNG or JPG, up to 2MB.</p>
            </PlatformPermissionGate>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
