// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useTranslations } from "next-intl";
// import type { LucideIcon } from "lucide-react";
// import { ChevronDown, ChevronRight, X } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { CompanyBrandMark } from "@/components/layout/company-brand-mark";
// import { Button } from "@/components/ui/button";
// import { PlatformPermissionGate, CompanyPermissionGate } from "@/components/shared/permission-gate";
// import { hasAnyPermission } from "@/lib/permissions";
// import { useAppSelector } from "@/store/hooks";
// import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
// import { isPlatformStaffUser } from "@/types/auth";
// import type { PlatformPermissionCode, CompanyPermissionCode } from "@/constants/permissions";

// export interface NavItem {
//   labelKey: string;
//   /** Group parent-এর নিজের route নেই — শুধু `children` থাকলে href optional। */
//   href?: string;
//   icon: LucideIcon;
//   /** কিছু না দিলে item সবসময় visible (যেমন নিজের Dashboard)। */
//   platformPermission?: PlatformPermissionCode | PlatformPermissionCode[];
//   companyPermission?: CompanyPermissionCode | CompanyPermissionCode[];
//   /** দিলে item একটা non-clickable group header হয়ে যায়, children indented থাকে। */
//   children?: NavItem[];
// }

// interface AppSidebarProps {
//   items: NavItem[];
//   /** Mobile drawer state — desktop (md+) ignores these and always shows statically. */
//   mobileOpen?: boolean;
//   onMobileClose?: () => void;
//   /**
//    * Overrides the default "D / DotSkills" platform brand with a
//    * company's own logo/name — only the company layout passes this. Left
//    * undefined (the platform layout never sets it), the original
//    * hardcoded platform mark renders unchanged, so Platform Admin stays
//    * untouched by construction, not by a runtime scope check.
//    */
//   brand?: { logoUrl: string | null; name: string };
// }

// /**
//  * Navigation hide হওয়া কোনো security boundary না (section 14) — শুধু
//  * relevant item দেখানোর UX। একই component platform ও company দুই
//  * sidebar-এই ব্যবহারযোগ্য, `items`-এর মধ্যে সঠিক scope-এর permission key
//  * দিলেই যথাযথ gate wrap হয়ে যায়।
//  *
//  * `mobileOpen`/`onMobileClose` UI-presentational state only (open/close
//  * toggle) — desktop layout/behavior unaffected either way.
//  */
// export function AppSidebar({ items, mobileOpen, onMobileClose, brand }: AppSidebarProps) {
//   const t = useTranslations("rbac");
//   const pathname = usePathname();

//   /**
//    * Group header ("Access Control", "Reports")-এর নিজস্ব permission নেই — কোনো child
//    * visible কিনা সেটা আগে থেকেই জানা লাগে (নাহলে সব child hidden হলেও empty header
//    * দেখা যাবে)। এই check platform ও company উভয় scope-এর children-এর জন্যই — একই
//    * branching যা top-level item-গুলোর জন্য নিচে ব্যবহার হয় (`item.platformPermission`
//    * থাকলে platform check, `item.companyPermission` থাকলে company check), শুধু grouped
//    * children-এর উপর প্রয়োগ করা (Frontend Phase 5-এ ধরা পড়া গ্যাপের ফিক্স — আগে শুধু
//    * platform-permission children check হতো, company-scoped grouped item-এর প্রতিটা
//    * child unconditionally visible হয়ে যেত)।
//    */
//   const platformUser = useAppSelector((state) => state.auth.user);
//   const platformPermissions =
//     platformUser && isPlatformStaffUser(platformUser) ? platformUser.permissions : [];
//   const { permissions: companyPermissions } = useCurrentCompany();

//   function isChildVisible(item: NavItem): boolean {
//     if (item.platformPermission) {
//       const required = Array.isArray(item.platformPermission) ? item.platformPermission : [item.platformPermission];
//       return hasAnyPermission(platformPermissions, required);
//     }
//     if (item.companyPermission) {
//       const required = Array.isArray(item.companyPermission) ? item.companyPermission : [item.companyPermission];
//       return hasAnyPermission(companyPermissions, required);
//     }
//     return true;
//   }

//   const navList = (
//     <nav className="flex h-full w-64 shrink-0 flex-col bg-sidebar">
//       <div className="hidden h-16 shrink-0 items-center gap-2.5 px-6 md:flex">
//         {brand ? (
//           <CompanyBrandMark logoUrl={brand.logoUrl} name={brand.name} /> 
//         ) : (
//           <>
//             <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
//               D
//             </span>
//             <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">DotSkills</span>
//           </>
//         )}
//       </div>
//       <div className="flex-1 overflow-y-auto p-4">
//         <div className="mb-2 flex items-center justify-between md:hidden">
//           <span className="text-xs font-medium tracking-wide text-sidebar-foreground uppercase">Menu</span>
//           <Button
//             variant="ghost"
//             size="icon-sm"
//             className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
//             onClick={onMobileClose}
//             aria-label="Close menu"
//           >
//             <X className="size-4" aria-hidden="true" />
//           </Button>
//         </div>
//         <div className="flex flex-col gap-1">
//           {items.map((item) => {
//             if (item.children) {
//               const visibleChildren = item.children.filter(isChildVisible);
//               if (visibleChildren.length === 0) return null;

//               return (
//                 <NavGroup
//                   key={item.labelKey}
//                   item={item}
//                   label={t(item.labelKey)}
//                   visibleChildren={visibleChildren}
//                   pathname={pathname}
//                   translate={t}
//                   onNavigate={onMobileClose}
//                 />
//               );
//             }

//             const link = (
//               <NavLink
//                 key={item.href}
//                 item={item}
//                 label={t(item.labelKey)}
//                 active={isActive(pathname, item.href)}
//                 onNavigate={onMobileClose}
//               />
//             );

//             if (item.platformPermission) {
//               return (
//                 <PlatformPermissionGate key={item.href} permission={item.platformPermission}>
//                   {link}
//                 </PlatformPermissionGate>
//               );
//             }

//             if (item.companyPermission) {
//               return (
//                 <CompanyPermissionGate key={item.href} permission={item.companyPermission}>
//                   {link}
//                 </CompanyPermissionGate>
//               );
//             }

//             return link;
//           })}
//         </div>
//       </div>
//       <div className="shrink-0 border-t border-sidebar-border px-4 py-3">
//         <p className="text-xs text-sidebar-foreground/60">© 2026 DotSkills</p>
//       </div>
//     </nav>
//   );

//   return (
//     <>
//       {/* Desktop: static, always visible */}
//       <div className="hidden h-full md:block">{navList}</div>

//       {/* Mobile: overlay drawer */}
//       {mobileOpen && (
//         <div className="fixed inset-0 z-50 md:hidden">
//           <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} aria-hidden="true" />
//           <div className="absolute inset-y-0 left-0 shadow-xl">{navList}</div>
//         </div>
//       )}
//     </>
//   );
// }

// /**
//  * Collapsible group header — নিজে navigate করে না, click করলে expand/collapse toggle করে।
//  * `manualOpen === null` মানে user এখনো manually toggle করেনি — তখন default state হয়
//  * "current route-এ কোনো child active কিনা" থেকে derive করা (route-driven auto-expand,
//  * browser refresh-এও কাজ করে যেহেতু এটা pathname থেকে সরাসরি বের করা, কোনো persisted
//  * client state না)। Manual toggle-এর পর সেটাই override করে যতক্ষণ component mounted থাকে।
//  */
// function NavGroup({
//   item,
//   label,
//   visibleChildren,
//   pathname,
//   translate,
//   onNavigate,
// }: {
//   item: NavItem;
//   label: string;
//   visibleChildren: NavItem[];
//   pathname: string;
//   translate: (key: string) => string;
//   onNavigate?: () => void;
// }) {
//   const Icon = item.icon;
//   const isRouteActive = visibleChildren.some((child) => isActive(pathname, child.href));
//   const [manualOpen, setManualOpen] = useState<boolean | null>(null);
//   const isOpen = manualOpen ?? isRouteActive;

//   return (
//     <div>
//       <button
//         type="button"
//         onClick={() => setManualOpen(!isOpen)}
//         aria-expanded={isOpen}
//         className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
//       >
//         <Icon className="size-4 shrink-0" aria-hidden="true" />
//         <span className="flex-1 text-left">{label}</span>
//         {isOpen ? (
//           <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
//         ) : (
//           <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
//         )}
//       </button>
//       <div
//         className={cn(
//           "grid transition-[grid-template-rows] duration-200 ease-in-out",
//           isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
//         )}
//       >
//         <div className="flex flex-col gap-1 overflow-hidden">
//           {visibleChildren.map((child) => (
//             <NavLink
//               key={child.href}
//               item={child}
//               label={translate(child.labelKey)}
//               active={isActive(pathname, child.href)}
//               onNavigate={onNavigate}
//               indented
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// function isActive(pathname: string, href?: string): boolean {
//   if (!href) return false;
//   return pathname === href || pathname.startsWith(`${href}/`);
// }

// function NavLink({
//   item,
//   label,
//   active,
//   onNavigate,
//   indented,
// }: {
//   item: NavItem;
//   label: string;
//   active: boolean;
//   onNavigate?: () => void;
//   indented?: boolean;
// }) {
//   const Icon = item.icon;

//   if (!item.href) return null;

//   return (
//     <Link
//       href={item.href}
//       onClick={onNavigate}
//       aria-current={active ? "page" : undefined}
//       className={cn(
//         "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors",
//         indented ? "pl-9 pr-3" : "px-3",
//         "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
//         active
//           ? "bg-sidebar-primary text-sidebar-primary-foreground"
//           : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
//       )}
//     >
//       <Icon className={cn("shrink-0", indented ? "size-4" : "size-5")} aria-hidden="true" />
//       {label}
//     </Link>
//   );
// }
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CompanyBrandMark } from "@/components/layout/company-brand-mark";
import { Button } from "@/components/ui/button";
import { PlatformPermissionGate, CompanyPermissionGate } from "@/components/shared/permission-gate";
import { hasAnyPermission } from "@/lib/permissions";
import { useAppSelector } from "@/store/hooks";
import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { isPlatformStaffUser } from "@/types/auth";
import type { PlatformPermissionCode, CompanyPermissionCode } from "@/constants/permissions";

export interface NavItem {
  labelKey: string;
  /** Group parent-এর নিজের route নেই — শুধু `children` থাকলে href optional। */
  href?: string;
  icon: LucideIcon;
  /** কিছু না দিলে item সবসময় visible (যেমন নিজের Dashboard)। */
  platformPermission?: PlatformPermissionCode | PlatformPermissionCode[];
  companyPermission?: CompanyPermissionCode | CompanyPermissionCode[];
  /** দিলে item একটা non-clickable group header হয়ে যায়, children indented থাকে। */
  children?: NavItem[];
}

interface AppSidebarProps {
  items: NavItem[];
  /** Mobile drawer state — desktop (md+) ignores these and always shows statically. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;

  /**
   * Desktop sidebar collapsed state.
   */
  collapsed?: boolean;

  /**
   * Desktop sidebar collapse/expand toggle.
   */
  onToggle?: () => void;

  /**
   * Overrides the default "D / DotSkills" platform brand with a
   * company's own logo/name — only the company layout passes this. Left
   * undefined (the platform layout never sets it), the original
   * hardcoded platform mark renders unchanged, so Platform Admin stays
   * untouched by construction, not by a runtime scope check.
   */
  brand?: { logoUrl: string | null; name: string };
}

/**
 * Navigation hide হওয়া কোনো security boundary না (section 14) — শুধু
 * relevant item দেখানোর UX। একই component platform ও company দুই
 * sidebar-এই ব্যবহারযোগ্য, `items`-এর মধ্যে সঠিক scope-এর permission key
 * দিলেই যথাযথ gate wrap হয়ে যায়।
 *
 * `mobileOpen`/`onMobileClose` UI-presentational state only (open/close
 * toggle) — desktop layout/behavior unaffected either way.
 */
export function AppSidebar({
  items,
  mobileOpen,
  onMobileClose,
  collapsed = false,
  onToggle,
  brand,
}: AppSidebarProps) {
  const t = useTranslations("rbac");
  const pathname = usePathname();

  /**
   * Group header ("Access Control", "Reports")-এর নিজস্ব permission নেই — কোনো child
   * visible কিনা সেটা আগে থেকেই জানা লাগে (নাহলে সব child hidden হলেও empty header
   * দেখা যাবে)। এই check platform ও company উভয় scope-এর children-এর জন্যই — একই
   * branching যা top-level item-গুলোর জন্য নিচে ব্যবহার হয় (`item.platformPermission`
   * থাকলে platform check, `item.companyPermission` থাকলে company check), শুধু grouped
   * children-এর উপর প্রয়োগ করা (Frontend Phase 5-এ ধরা পড়া গ্যাপের ফিক্স — আগে শুধু
   * platform-permission children check হতো, company-scoped grouped item-এর প্রতিটা
   * child unconditionally visible হয়ে যেত)।
   */
  const platformUser = useAppSelector((state) => state.auth.user);
  const platformPermissions =
    platformUser && isPlatformStaffUser(platformUser) ? platformUser.permissions : [];
  const { permissions: companyPermissions } = useCurrentCompany();

  function isChildVisible(item: NavItem): boolean {
    if (item.platformPermission) {
      const required = Array.isArray(item.platformPermission)
        ? item.platformPermission
        : [item.platformPermission];

      return hasAnyPermission(platformPermissions, required);
    }

    if (item.companyPermission) {
      const required = Array.isArray(item.companyPermission)
        ? item.companyPermission
        : [item.companyPermission];

      return hasAnyPermission(companyPermissions, required);
    }

    return true;
  }

  const navList = (
    <nav
      className={cn(
        "flex h-full shrink-0 flex-col bg-sidebar transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "hidden h-16 shrink-0 items-center md:flex",
          collapsed ? "justify-center px-2" : "gap-3 px-6",
        )}
      >
        {brand ? (
          <CompanyBrandMark
            logoUrl={brand.logoUrl}
            name={brand.name}
          />
        ) : (
          <>
            <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              D
            </span>

            {!collapsed && (
              <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
                DotSkills
              </span>
            )}
          </>
        )}

        {/* Desktop collapse button */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed ? "absolute left-[52px]" : "ml-auto",
          )}
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-2 flex items-center justify-between md:hidden">
          <span className="text-xs font-medium tracking-wide text-sidebar-foreground uppercase">
            Menu
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          {items.map((item) => {
            if (item.children) {
              const visibleChildren = item.children.filter(isChildVisible);

              if (visibleChildren.length === 0) return null;

              return (
                <NavGroup
                  key={item.labelKey}
                  item={item}
                  label={t(item.labelKey)}
                  visibleChildren={visibleChildren}
                  pathname={pathname}
                  translate={t}
                  onNavigate={onMobileClose}
                  collapsed={collapsed}
                />
              );
            }

            const link = (
              <NavLink
                key={item.href}
                item={item}
                label={t(item.labelKey)}
                active={isActive(pathname, item.href)}
                onNavigate={onMobileClose}
                collapsed={collapsed}
              />
            );

            if (item.platformPermission) {
              return (
                <PlatformPermissionGate
                  key={item.href}
                  permission={item.platformPermission}
                >
                  {link}
                </PlatformPermissionGate>
              );
            }

            if (item.companyPermission) {
              return (
                <CompanyPermissionGate
                  key={item.href}
                  permission={item.companyPermission}
                >
                  {link}
                </CompanyPermissionGate>
              );
            }

            return link;
          })}
        </div>
      </div>

      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border py-3",
          collapsed ? "px-2" : "px-4",
        )}
      >
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/60">
            © 2026 DotSkills
          </p>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop: static, always visible */}
      <div className="hidden h-full md:block">{navList}</div>

      {/* Mobile: overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          <div className="absolute inset-y-0 left-0 shadow-xl">
            {navList}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Collapsible group header — নিজে navigate করে না, click করলে expand/collapse toggle করে।
 * `manualOpen === null` মানে user এখনো manually toggle করেনি — তখন default state হয়
 * "current route-এ কোনো child active কিনা" থেকে derive করা (route-driven auto-expand,
 * browser refresh-এও কাজ করে যেহেতু এটা pathname থেকে সরাসরি বের করা, কোনো persisted
 * client state না)। Manual toggle-এর পর সেটাই override করে যতক্ষণ component mounted থাকে।
 */
function NavGroup({
  item,
  label,
  visibleChildren,
  pathname,
  translate,
  onNavigate,
  collapsed,
}: {
  item: NavItem;
  label: string;
  visibleChildren: NavItem[];
  pathname: string;
  translate: (key: string) => string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const Icon = item.icon;

  const isRouteActive = visibleChildren.some((child) =>
    isActive(pathname, child.href),
  );

  const [manualOpen, setManualOpen] = useState<boolean | null>(null);

  const isOpen = manualOpen ?? isRouteActive;

  /*
   * Collapsed desktop sidebar:
   * শুধু icon দেখা যাবে।
   * Icon click করলে children ছোট floating menu হিসেবে দেখাবে।
   */
  if (collapsed) {
    return (
      <div className="group relative">
        <button
          type="button"
          onClick={() => setManualOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={label}
          title={label}
          className={cn(
            "flex w-full items-center justify-center rounded-lg px-2 py-2.5 transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isRouteActive &&
              "bg-sidebar-primary text-sidebar-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          )}
        >
          <Icon className="size-5 shrink-0" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute left-[68px] top-0 z-50 min-w-52 rounded-lg border border-sidebar-border bg-sidebar p-2 shadow-xl">
            <div className="mb-1 px-2 py-1.5 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase">
              {label}
            </div>

            <div className="flex flex-col gap-1">
              {visibleChildren.map((child) => (
                <NavLink
                  key={child.href}
                  item={child}
                  label={translate(child.labelKey)}
                  active={isActive(pathname, child.href)}
                  onNavigate={onNavigate}
                  collapsed={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setManualOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />

        <span className="flex-1 text-left">{label}</span>

        {isOpen ? (
          <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
        )}
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="flex flex-col gap-1 overflow-hidden">
          {visibleChildren.map((child) => (
            <NavLink
              key={child.href}
              item={child}
              label={translate(child.labelKey)}
              active={isActive(pathname, child.href)}
              onNavigate={onNavigate}
              indented
              collapsed={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function isActive(pathname: string, href?: string): boolean {
  if (!href) return false;

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  label,
  active,
  onNavigate,
  indented,
  collapsed,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  indented?: boolean;
  collapsed?: boolean;
}) {
  const Icon = item.icon;

  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors",
        collapsed
          ? "justify-center px-2"
          : "gap-3",
        !collapsed && indented
          ? "pl-9 pr-3"
          : !collapsed
            ? "px-3"
            : "",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon
        className={cn(
          "shrink-0",
          indented ? "size-4" : "size-5",
        )}
        aria-hidden="true"
      />

      {!collapsed && label}
    </Link>
  );
}