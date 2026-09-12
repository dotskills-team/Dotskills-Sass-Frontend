"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

import { useGetMyProfileQuery } from "@/features/user-profile/api/user-profile.api";
import { ProfileImageUpload } from "@/features/user-profile/components/profile-image-upload";
import { ChangeNameForm } from "@/features/user-profile/components/change-name-form";
import { ChangePasswordForm } from "@/features/user-profile/components/change-password-form";

/**
 * No permission gate — every logged-in platform user manages only their
 * OWN profile (scoped entirely by the JWT on the backend), so there is
 * nothing here to gate beyond being authenticated (already enforced by
 * `(platform)/layout.tsx`'s `AuthGate`).
 */
export default function PlatformProfilePage() {
  const t = useTranslations("userProfile");
  const { data: profile, isLoading, error, refetch } = useGetMyProfileQuery();

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="max-w-2xl space-y-6 p-6">
        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : profile ? (
          <>
            <Card>
              <CardContent>
                <ProfileImageUpload
                  profileImageUrl={profile.profileImageUrl}
                  fullName={profile.fullName}
                  email={profile.email}
                />
              </CardContent>
            </Card>
            <ChangeNameForm fullName={profile.fullName} />
            <ChangePasswordForm />
          </>
        ) : null}
      </div>
    </>
  );
}
