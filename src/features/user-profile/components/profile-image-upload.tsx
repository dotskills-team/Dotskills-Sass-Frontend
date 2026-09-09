"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useUploadProfileImageMutation } from "@/features/user-profile/api/user-profile.api";
import { validateImageFile } from "@/lib/validation/image-file";
import { normalizeApiError } from "@/lib/api-error";

/**
 * Mirrors `CompanyLogoUpload`'s structure/behavior — immediate upload on
 * file selection, client-side validation is fail-fast only (the server
 * always re-validates independently, see UserProfileController's
 * ParseFilePipeBuilder + UserProfileService's own mimetype check).
 */
export function ProfileImageUpload({
  profileImageUrl,
  fullName,
}: {
  profileImageUrl: string | null;
  fullName: string;
}) {
  const t = useTranslations("userProfile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProfileImage, { isLoading }] = useUploadProfileImageMutation();

  function resetInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(t(`photo.${validationError}`));
      resetInput();
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    void handleUpload(file);
  }

  async function handleUpload(file: File) {
    const result = await uploadProfileImage({ file });
    resetInput();

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      setPreviewUrl(null);
      return;
    }
    toast.success(t("photo.uploadSuccess"));
    setPreviewUrl(null);
  }

  const initial = (fullName.trim()[0] ?? "?").toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("photo.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={previewUrl ?? profileImageUrl ?? undefined} alt={fullName} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <label htmlFor="profile-image-file" className="text-sm font-medium">
              {t("photo.uploadLabel")}
            </label>
            <input
              id="profile-image-file"
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileSelected}
              disabled={isLoading}
              className="block w-full rounded-md border border-input px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <p className="text-sm text-muted-foreground">{t("photo.help")}</p>
          </div>

          {isLoading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />}
        </div>
      </CardContent>
    </Card>
  );
}
