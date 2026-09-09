"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { ScopeGuard } from "@/features/auth/components/scope-guard";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CompanySelector } from "@/features/company/components/company-selector";
import { CompanyContextGate } from "@/features/company/components/company-context-gate";
import { CashDrawerStatusIndicator } from "@/features/cash-drawer/components/cash-drawer-status-indicator";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { ProfileAvatarLink } from "@/components/layout/profile-avatar-link";
import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { CompanyBrandMark } from "@/components/layout/company-brand-mark";
import { Button } from "@/components/ui/button";

import { companyNavItems } from "./nav-items";

/**
 * "use client" প্রয়োজন — `(platform)/layout.tsx`-এর একই কারণে:
 * `companyNavItems`-এর icon (Lucide function reference) Server→Client
 * boundary-এ serialize করা যায় না। AuthGate/ScopeGuard already client
 * component, তাই পুরো layout client বানানোই simplest সঠিক fix।
 *
 * `mobileNavOpen` UI-presentational drawer toggle only — behavior অপরিবর্তিত।
 */
export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { company } = useCurrentCompany();

  return (
    <AuthGate>
      <ScopeGuard requiredScope="company">
        <div className="min-h-screen bg-background">
          <div className="md:fixed md:inset-y-0 md:left-0 md:z-40">
            <AppSidebar
              items={companyNavItems}
              mobileOpen={mobileNavOpen}
              onMobileClose={() => setMobileNavOpen(false)}
              brand={{ logoUrl: company?.logoUrl ?? null, name: company?.companyName ?? "DotSkills" }}
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
                <div className="flex items-center md:hidden">
                  <CompanyBrandMark logoUrl={company?.logoUrl ?? null} name={company?.companyName ?? "DotSkills"} />
                </div>
                <CompanySelector />
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell companyId={company?.companyId} />
                <CashDrawerStatusIndicator companyId={company?.companyId} />
                <LanguageSwitcher />
                <ProfileAvatarLink href="/company/profile" />
                <LogoutButton />
              </div>
            </header>
            <main className="min-w-0 flex-1">
              <div className="mx-auto w-full max-w-[1400px]">
                <CompanyContextGate>{children}</CompanyContextGate>
              </div>
            </main>
          </div>
        </div>
      </ScopeGuard>
    </AuthGate>
  );
}
