// // import type { LucideIcon } from "lucide-react";

// // import { Card, CardContent } from "@/components/ui/card";
// // import { cn } from "@/lib/utils";

// // export type KpiTone = "primary" | "success" | "warning" | "destructive" | "info";

// // /** Icon-badge background/foreground per tone — reuses the app's existing semantic color tokens, never a new palette. */
// // const TONE_BADGE_CLASS: Record<KpiTone, string> = {
// //   primary: "bg-primary/15 text-primary",
// //   success: "bg-success/15 text-success",
// //   warning: "bg-warning/15 text-warning",
// //   destructive: "bg-destructive/10 text-destructive",
// //   info: "bg-info/15 text-info",
// // };

// // /** Value-text color per tone — same token set as the badge, so the number reads as one color story with its icon. */
// // const TONE_TEXT_CLASS: Record<KpiTone, string> = {
// //   primary: "text-primary",
// //   success: "text-success",
// //   warning: "text-warning",
// //   destructive: "text-destructive",
// //   info: "text-info",
// // };

// // export function KpiCard({
// //   icon: Icon,
// //   label,
// //   value,
// //   helperText,
// //   onClick,
// //   tone,
// // }: {
// //   icon: LucideIcon;
// //   label: string;
// //   value: string;
// //   helperText?: string;
// //   onClick?: () => void;
// //   /** Optional semantic tint for the icon badge — omit to keep the original plain/neutral look. */
// //   tone?: KpiTone;
// // }) {
// //   return (
// //     <Card
// //       className={cn(onClick && "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md")}
// //       onClick={onClick}
// //       role={onClick ? "button" : undefined}
// //       tabIndex={onClick ? 0 : undefined}
// //     >
// //       <CardContent className="p-5">
// //         <p className="text-sm text-muted-foreground">{label}</p>
// //         <div className="mt-3 flex items-center gap-3">
// //           <span
// //             className={cn(
// //               "flex size-12 shrink-0 items-center justify-center rounded-xl",
// //               tone ? TONE_BADGE_CLASS[tone] : "bg-muted text-muted-foreground",
// //             )}
// //           >
// //             <Icon className="size-6" aria-hidden="true" />
// //           </span>
// //           <p
// //             className={cn(
// //               "text-2xl font-bold tracking-tight",
// //               tone ? TONE_TEXT_CLASS[tone] : "text-foreground",
// //             )}
// //           >
// //             {value}
// //           </p>
// //         </div>
// //         {helperText && <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>}
// //       </CardContent>
// //     </Card>
// //   );
// // }

// import type { LucideIcon } from "lucide-react";

// import { Card, CardContent } from "@/components/ui/card";
// import { cn } from "@/lib/utils";

// export type KpiTone =
//   | "primary"
//   | "success"
//   | "warning"
//   | "destructive"
//   | "info";

// const TONE_BADGE_CLASS: Record<KpiTone, string> = {
//   primary: "bg-primary/10 text-primary ring-primary/10",
//   success: "bg-success/10 text-success ring-success/10",
//   warning: "bg-warning/10 text-warning ring-warning/10",
//   destructive: "bg-destructive/10 text-destructive ring-destructive/10",
//   info: "bg-info/10 text-info ring-info/10",
// };

// const TONE_TEXT_CLASS: Record<KpiTone, string> = {
//   primary: "text-primary",
//   success: "text-success",
//   warning: "text-warning",
//   destructive: "text-destructive",
//   info: "text-info",
// };

// export function KpiCard({
//   icon: Icon,
//   label,
//   value,
//   helperText,
//   onClick,
//   tone,
// }: {
//   icon: LucideIcon;
//   label: string;
//   value: string;
//   helperText?: string;
//   onClick?: () => void;
//   tone?: KpiTone;
// }) {
//   return (
//     <Card
//       className={cn(
//         "group relative overflow-hidden border-border/60 bg-card",
//         "transition-all duration-300",
//         onClick &&
//         "cursor-pointer hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg",
//       )}
//       onClick={onClick}
//       role={onClick ? "button" : undefined}
//       tabIndex={onClick ? 0 : undefined}
//     >
//       {/* Subtle top accent */}
//       {tone && (
//         <div
//           className={cn(
//             "absolute inset-x-0 top-0 h-0.5 opacity-70",
//             tone === "primary" && "bg-primary",
//             tone === "success" && "bg-success",
//             tone === "warning" && "bg-warning",
//             tone === "destructive" && "bg-destructive",
//             tone === "info" && "bg-info",
//           )}
//         />
//       )}

//       <CardContent className="p-5">
//         {/* Icon */}
//         <div className="flex items-start justify-between">
//           <div
//             className={cn(
//               "flex size-11 items-center justify-center rounded-xl",
//               "ring-1 transition-transform duration-300",
//               "group-hover:scale-105",
//               tone
//                 ? TONE_BADGE_CLASS[tone]
//                 : "bg-muted text-muted-foreground ring-border/50",
//             )}
//           >
//             <Icon className="size-5" aria-hidden="true" />
//           </div>
//         </div>

//         {/* Label */}
//         <p className="mt-4 text-sm font-medium text-muted-foreground">
//           {label}
//         </p>

//         {/* Value */}
//         {/* <p
//           className={cn(
//             "mt-1 text-2xl font-bold tracking-tight sm:text-3xl",
//             tone ? TONE_TEXT_CLASS[tone] : "text-foreground",
//           )}
//         >
//           {value}
//         </p> */}
//         <p
//           className={cn(
//             "mt-1 font-bold tracking-tight",
//             "text-lg sm:text-xl md:text-xl lg:text-2xl",
//             "break-all leading-tight",
//             tone ? TONE_TEXT_CLASS[tone] : "text-foreground",
//           )}
//         >
//           {value}
//         </p>

//         {/* Helper text */}
//         {helperText && (
//           <p className="mt-2 text-xs text-muted-foreground">
//             {helperText}
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KpiTone =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info";

/* UI ONLY — icon tile: tinted fill + hairline ring per tone */
const TONE_BADGE_CLASS: Record<KpiTone, string> = {
  primary: "bg-primary/12 text-primary ring-primary/25",
  success: "bg-success/12 text-success ring-success/25",
  warning: "bg-warning/12 text-warning ring-warning/25",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  info: "bg-info/12 text-info ring-info/25",
};

const TONE_TEXT_CLASS: Record<KpiTone, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

/* UI ONLY — top accent line: fades out to the right instead of a flat bar */
const TONE_ACCENT_CLASS: Record<KpiTone, string> = {
  primary: "from-primary",
  success: "from-success",
  warning: "from-warning",
  destructive: "from-destructive",
  info: "from-info",
};

/* UI ONLY — soft corner glow that brightens on hover */
const TONE_GLOW_CLASS: Record<KpiTone, string> = {
  primary: "bg-primary/25",
  success: "bg-success/25",
  warning: "bg-warning/25",
  destructive: "bg-destructive/20",
  info: "bg-info/25",
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  helperText,
  onClick,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helperText?: string;
  onClick?: () => void;
  tone?: KpiTone;
}) {
  return (
    /* UI ONLY — glass surface, layered shadow, hover lift (clickable cards only) */
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border-border/60 bg-card/70 backdrop-blur-xl",
        "shadow-[0_8px_32px_-14px_rgb(40_20_120/0.22)]",
        "transition-all duration-200 motion-reduce:transition-none",
        onClick &&
          "cursor-pointer outline-none hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_14px_36px_-12px_rgb(40_20_120/0.32)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:hover:translate-y-0",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* UI ONLY — tone accent line + corner glow */}
      {tone && (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r to-transparent opacity-80",
              TONE_ACCENT_CLASS[tone],
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -right-8 -top-8 size-28 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none",
              TONE_GLOW_CLASS[tone],
            )}
          />
        </>
      )}

      <CardContent className="relative p-5">
        {/* Icon */}
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              "ring-1 transition-transform duration-300 motion-reduce:transition-none",
              "group-hover:scale-105 motion-reduce:group-hover:scale-100",
              tone
                ? TONE_BADGE_CLASS[tone]
                : "bg-muted text-muted-foreground ring-border/50",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>

        {/* Label */}
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          {label}
        </p>

        {/* Value — tabular figures so numbers align across cards */}
        <p
          className={cn(
            "mt-1 font-bold tracking-tight tabular-nums",
            "text-lg sm:text-xl md:text-xl lg:text-2xl",
            "break-all leading-tight",
            tone ? TONE_TEXT_CLASS[tone] : "text-foreground",
          )}
        >
          {value}
        </p>

        {/* Helper text */}
        {helperText && (
          <p className="mt-2 text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
