import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { StoreProvider } from "@/store/provider";

import "./globals.css";

/**
 * UI-polish pass: `--font-sans` (used by `globals.css`'s `@theme inline`
 * block) was never actually connected to the old Geist Sans import — a
 * dead CSS variable, so body text silently fell back to the browser's
 * default sans-serif. Inter now fills that same `--font-sans` slot
 * directly, fixing the wiring and satisfying the "professional SaaS
 * font" requirement in one change — no other token name changed, so
 * every existing `font-sans`/`font-heading` utility class keeps working.
 */
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DotSkills",
  description:
    "Multi-Tenant, Multi-Company, Multi-Industry SaaS Business Management Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextIntlClientProvider locale={locale} messages={messages}>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
