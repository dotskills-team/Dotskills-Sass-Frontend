"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useUploadProfileImageMutation } from "@/features/user-profile/api/user-profile.api";
import { validateImageFile } from "@/lib/validation/image-file";
import { normalizeApiError } from "@/lib/api-error";

/**
 * Large, hero-style avatar with a floating camera button (instead of a raw
 * `<input type="file">` row) — click anywhere on the avatar or the camera
 * button opens the file picker. Upload still fires immediately on
 * selection, same mutation/validation as before.
 */
export function ProfileImageUpload({
  profileImageUrl,
  fullName,
  email,
}: {
  profileImageUrl: string | null;
  fullName: string;
  email: string | null;
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
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <Avatar className="size-28 text-3xl shadow-sm ring-4 ring-background">
          <AvatarImage src={previewUrl ?? profileImageUrl ?? undefined} alt={fullName} />
          <AvatarFallback className="text-3xl">{initial}</AvatarFallback>
        </Avatar>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label={t("photo.changePhoto")}
          className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="size-4" aria-hidden="true" />
          )}
        </button>

        <input
          id="profile-image-file"
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileSelected}
          disabled={isLoading}
          className="sr-only"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
        <h2 className="truncate font-heading text-xl font-semibold text-foreground">{fullName}</h2>
        {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Camera className="size-4" aria-hidden="true" />
          {t("photo.changePhoto")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("photo.help")}</p>
      </div>
    </div>
  );
}
