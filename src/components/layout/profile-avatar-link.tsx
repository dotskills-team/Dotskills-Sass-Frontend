"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMyProfileQuery } from "@/features/user-profile/api/user-profile.api";

/**
 * A profile photo is conventionally circular/cropped — the opposite
 * conclusion from the company-logo navbar case — so this wraps the
 * existing, unmodified `Avatar` primitive directly (not `CompanyBrandMark`).
 * Self-fetches via `useGetMyProfileQuery()`, same self-contained-header-widget
 * pattern as `NotificationBell`.
 */
export function ProfileAvatarLink({ href }: { href: string }) {
  const { data: profile } = useGetMyProfileQuery();

  const initial = (profile?.fullName.trim()[0] ?? "?").toUpperCase();

  return (
    <Link href={href} aria-label="My profile">
      <Avatar>
        <AvatarImage src={profile?.profileImageUrl ?? undefined} alt={profile?.fullName ?? ""} />
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
