"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { ScopeGuard } from "@/features/auth/components/scope-guard";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { CompanyBrandMark } from "@/components/layout/company-brand-mark";
import { Button } from "@/components/ui/button";

import { useGetPlatformSettingsQuery } from "@/features/platform-settings/api/platform-settings.api";
import { platformNavItems } from "./nav-items";

/**
 * Section 20: Platform user company context ছাড়াই কাজ করে — এখানে কোনো CompanySelector নেই।
 *
 * "use client" প্রয়োজন: `platformNavItems`-এর প্রতিটা item-এ একটা Lucide
 * icon component (function reference) থাকে। এই layout আগে Server
 * Component ছিল আর `<AppSidebar items={platformNavItems} />`-কে (Client
 * Component) props হিসেবে পাঠাত — Server→Client boundary crossing করার
 * সময় React function/class value serialize করতে পারে না, তাই browser-এ
 * "Only plain objects can be passed to Client Components" crash হতো।
 * যেহেতু AuthGate/ScopeGuard আগে থেকেই Client Component (কোনো real
 * server work এই layout করে না), পুরো layout-টাকেই Client Component
 * বানানো simplest সঠিক fix — এতে icon সহ পুরো `platformNavItems`
 * same-realm JS reference হিসেবে সরাসরি pass হয়, কোনো serialization লাগে না।
 *
 * `mobileNavOpen` UI-presentational drawer toggle (open/close only) —
 * auth/scope/permission behavior সম্পূর্ণ অপরিবর্তিত।
 */
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: platformSettings } = useGetPlatformSettingsQuery();
  // Only override the default "D / DotSkills Platform" mark once a real
  // logo has actually been uploaded — otherwise keep the original wordmark
  // rather than switching to CompanyBrandMark's circular-letter fallback.
  const brand = platformSettings?.logoUrl
    ? { logoUrl: platformSettings.logoUrl, name: "DotSkills Platform" }
    : undefined;

  return (
    <AuthGate>
      <ScopeGuard requiredScope="platform">
        <div className="min-h-screen bg-background">
          <div className="md:fixed md:inset-y-0 md:left-0 md:z-40">
            <AppSidebar
              items={platformNavItems}
              mobileOpen={mobileNavOpen}
              onMobileClose={() => setMobileNavOpen(false)}
              brand={brand}
            />
          </div>
          <div className="flex min-h-screen flex-col md:pl-64">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-sidebar/95 px-4 backdrop-blur supports-backdrop-filter:bg-sidebar/80 sm:px-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
                <div className="flex h-7 items-center gap-2 md:hidden">
                  {brand ? (
                    <CompanyBrandMark logoUrl={brand.logoUrl} name={brand.name} />
                  ) : (
                    <>
                      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                        D
                      </span>
                      <span className="font-semibold tracking-tight text-foreground">DotSkills Platform</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ProfileMenu href="/platform/profile" />
              </div>
            </header>
            <main className="min-w-0 flex-1">
              <div className="mx-auto w-full max-w-[1400px]">{children}</div>
            </main>
          </div>
        </div>
      </ScopeGuard>
    </AuthGate>
  );
}
