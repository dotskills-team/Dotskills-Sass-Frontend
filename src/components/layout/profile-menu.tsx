"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMyProfileQuery } from "@/features/user-profile/api/user-profile.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loggedOut } from "@/store/slices/auth.slice";
import { companyCleared } from "@/store/slices/company.slice";
import { baseApi } from "@/store/api/base-api";
import { useLogoutMutation } from "@/features/auth/api/auth.api";

/**
 * Navbar avatar + first name — click opens a dropdown with exactly two
 * items: Profile (navigates to `href`) and Logout (same session-clearing
 * flow `LogoutButton` used, now inlined here since this replaces both the
 * old separate avatar-link and logout-button navbar widgets).
 */
export function ProfileMenu({ href }: { href: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [logout, { isLoading }] = useLogoutMutation();

  const { data: profile } = useGetMyProfileQuery();

  const fullName = profile?.fullName.trim() ?? "";
  const firstName = fullName.split(/\s+/)[0] || "";
  const initial = (fullName[0] ?? "?").toUpperCase();

  async function handleLogout() {
    await logout({ accessToken });
    // পরের user-এর জন্য আগের user-এর RTK Query cache (company data, ইত্যাদি)
    // যেন কোনোভাবেই দেখা না যায়।
    dispatch(baseApi.util.resetApiState());
    dispatch(loggedOut());
    dispatch(companyCleared());
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
          aria-label="Account menu"
        >
          <Avatar>
            <AvatarImage src={profile?.profileImageUrl ?? undefined} alt={fullName} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate font-medium text-foreground sm:inline">
            {firstName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => router.push(href)}>
          <User aria-hidden="true" />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout} disabled={isLoading} variant="destructive">
          <LogOut aria-hidden="true" />
          {isLoading ? t("loggingOut") : t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
