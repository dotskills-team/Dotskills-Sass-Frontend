"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loggedOut } from "@/store/slices/auth.slice";
import { companyCleared } from "@/store/slices/company.slice";
import { baseApi } from "@/store/api/base-api";
import { useLogoutMutation } from "@/features/auth/api/auth.api";

export function LogoutButton() {
  const t = useTranslations("auth");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [logout, { isLoading }] = useLogoutMutation();

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
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading}>
      <LogOut className="size-4" aria-hidden="true" />
      {isLoading ? t("loggingOut") : t("logout")}
    </Button>
  );
}
