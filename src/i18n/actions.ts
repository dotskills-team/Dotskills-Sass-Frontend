"use server";

import { cookies } from "next/headers";

import { isValidLocale, localeCookieName, type Locale } from "./config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocaleAction(locale: Locale): Promise<void> {
  if (!isValidLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
}
