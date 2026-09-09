import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Navbar-only brand mark — deliberately NOT the shared `Avatar`/`AvatarImage`
 * from `@/components/ui/avatar.tsx` (that one hardcodes a circular,
 * `object-cover`-cropped square, correct for the other places it's used —
 * Company Settings' logo preview, the receipt — but wrong here, where the
 * whole, un-cropped logo at its own proportions is required). Built on the
 * same underlying Radix primitives that wrapper uses, so the "never a
 * broken image" automatic fallback-on-load-error guarantee still holds —
 * that behavior is intrinsic to Radix's Avatar.Image/Avatar.Fallback pair,
 * not tied to any particular styling.
 *
 * Real logo: fixed height, auto width (capped), `object-contain` — a wide
 * logo renders wide, a square one stays compact, nothing is ever cropped.
 * No logo (or a failed load): a circular letter-avatar fallback — kept
 * round on purpose, since a placeholder is a deliberately different,
 * decorative shape from a real uploaded brand mark.
 */
export function CompanyBrandMark({
  logoUrl,
  name,
  className,
}: {
  logoUrl: string | null;
  name: string;
  className?: string;
}) {
  return (
    <AvatarPrimitive.Root className={cn("flex h-full w-auto shrink-0 select-none items-center", className)}>
      <AvatarPrimitive.Image
        src={logoUrl ?? undefined}
        alt={name}
        className="h-full w-auto  object-contain"
      />
      <AvatarPrimitive.Fallback className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
        {(name.trim()[0] ?? "?").toUpperCase()}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
