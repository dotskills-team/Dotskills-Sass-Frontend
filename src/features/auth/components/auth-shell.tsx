import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Barcode, Boxes, HandCoins, ShieldCheck, ShoppingCart } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";

/**
 * Shared layout for /login, /platform/login and `/` (which renders /login).
 * Left: what the product does, with one illustrated sample receipt.
 * Right: the form. On mobile the left panel is hidden and a compact brand
 * header is shown instead.
 *
 * Self-contained copy (bn/en) so no translation JSON changes are needed.
 */

const COPY = {
  en: {
    headline: "Run every counter, shelf and ledger from one place.",
    sub: "DotSkills brings sales, stock, purchases and customer dues together for your shop or business.",
    points: [
      { icon: "pos", text: "Sell fast at the counter with barcode, cash, card, bKash and Nagad." },
      { icon: "stock", text: "See stock for every branch and warehouse, and get told before an item runs out." },
      { icon: "due", text: "Keep customer dues and supplier payments accurate, down to the last taka." },
      { icon: "access", text: "Give each team member access only to what their job needs." },
    ],
    receiptTitle: "Sample sale",
    receiptNote: "Illustration only",
    items: [
      { name: "Rice, 5 kg", price: 425 },
      { name: "Soybean oil, 1 L", price: 185 },
      { name: "Sugar, 1 kg", price: 130 },
    ],
    total: "Total",
    cash: "Cash",
    bkash: "bKash",
    switchCompany: "Platform staff?",
    switchCompanyLink: "Sign in here",
    switchPlatform: "Business owner or staff?",
    switchPlatformLink: "Go to company login",
    platformBadge: "Platform console",
    rights: "All rights reserved.",
  },
  bn: {
    headline: "প্রতিটি কাউন্টার, তাক আর হিসাব, সবকিছু এক জায়গা থেকে চালান।",
    sub: "DotSkills আপনার দোকান বা ব্যবসার বিক্রয়, স্টক, ক্রয় আর কাস্টমারের বাকি এক জায়গায় এনে দেয়।",
    points: [
      { icon: "pos", text: "বারকোড, ক্যাশ, কার্ড, বিকাশ আর নগদে কাউন্টারে দ্রুত বিক্রি করুন।" },
      { icon: "stock", text: "প্রতিটি শাখা ও গুদামের স্টক দেখুন, আর পণ্য ফুরানোর আগেই জানুন।" },
      { icon: "due", text: "কাস্টমারের বাকি আর সাপ্লায়ারের পাওনা টাকায় টাকায় সঠিক রাখুন।" },
      { icon: "access", text: "প্রত্যেক সদস্য শুধু তার কাজের জন্য দরকারি অংশটুকুই দেখতে পাবে।" },
    ],
    receiptTitle: "নমুনা বিক্রয়",
    receiptNote: "শুধু উদাহরণ",
    items: [
      { name: "চাল, ৫ কেজি", price: 425 },
      { name: "সয়াবিন তেল, ১ লিটার", price: 185 },
      { name: "চিনি, ১ কেজি", price: 130 },
    ],
    total: "মোট",
    cash: "ক্যাশ",
    bkash: "বিকাশ",
    switchCompany: "প্ল্যাটফর্ম স্টাফ?",
    switchCompanyLink: "এখানে লগইন করুন",
    switchPlatform: "ব্যবসার মালিক বা কর্মী?",
    switchPlatformLink: "কোম্পানি লগইনে যান",
    platformBadge: "প্ল্যাটফর্ম কনসোল",
    rights: "সর্বস্বত্ব সংরক্ষিত।",
  },
} as const;

const ICONS = {
  pos: ShoppingCart,
  stock: Boxes,
  due: HandCoins,
  access: ShieldCheck,
} as const;

// Fixed bar widths so the sample barcode is deterministic (no hydration drift).
const BAR_WIDTHS = [2, 1, 3, 1, 2, 2, 1, 3, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 2, 1];

interface AuthShellProps {
  variant: "company" | "platform";
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export async function AuthShell({ variant, title, subtitle, children }: AuthShellProps) {
  const locale = await getLocale();
  const c = locale === "bn" ? COPY.bn : COPY.en;
  const numberLocale = locale === "bn" ? "bn-BD" : "en-US";
  const fmt = (n: number) => `৳ ${n.toLocaleString(numberLocale)}`;

  const total = c.items.reduce((sum, item) => sum + item.price, 0);
  const cashPaid = 500;
  const bkashPaid = total - cashPaid;

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.05fr_1fr]">
      {/* ================= Left: product panel (desktop only) ================= */}
      <aside
        className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--primary-foreground) 14%, transparent) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      >
        <Brand light />

        <div className="max-w-xl space-y-10">
          <div className="space-y-4">
            <h1 className="text-balance text-3xl font-semibold leading-[1.15] tracking-tight xl:text-3xl">
              {c.headline}
            </h1>
            <p className="max-w-md text-base leading-7 text-primary-foreground/80">{c.sub}</p>
          </div>

          <div className="grid items-start gap-10 xl:grid-cols-[1fr_16rem]">
            <ul className="space-y-5">
              {c.points.map((point) => {
                const Icon = ICONS[point.icon];
                return (
                  <li key={point.icon} className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-6 text-primary-foreground/90">{point.text}</span>
                  </li>
                );
              })}
            </ul>

            {/* The one memorable element: a sample receipt */}
            <figure
              className="-rotate-2 rounded-md bg-white p-4 text-neutral-900 shadow-2xl"
              aria-label={c.receiptTitle}
            >
              <figcaption className="flex items-baseline justify-between border-b border-dashed border-neutral-300 pb-2">
                <span className="text-sm font-semibold">{c.receiptTitle}</span>
                <span className="text-[11px] text-neutral-500">{c.receiptNote}</span>
              </figcaption>

              <ul className="space-y-1.5 py-3 text-xs">
                {c.items.map((item) => (
                  <li key={item.name} className="flex justify-between gap-3">
                    <span>{item.name}</span>
                    <span className="tabular-nums">{fmt(item.price)}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-1 border-t border-dashed border-neutral-300 pt-2 text-xs">
                <div className="flex justify-between text-sm font-semibold">
                  <span>{c.total}</span>
                  <span className="tabular-nums">{fmt(total)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{c.cash}</span>
                  <span className="tabular-nums">{fmt(cashPaid)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{c.bkash}</span>
                  <span className="tabular-nums">{fmt(bkashPaid)}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-[2px]" aria-hidden="true">
                {BAR_WIDTHS.map((w, i) => (
                  <span key={i} className="block h-8 bg-neutral-900" style={{ width: `${w}px` }} />
                ))}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-neutral-500">
                <Barcode className="size-3" aria-hidden="true" />
                <span className="tabular-nums">890100000050</span>
              </div>
            </figure>
          </div>
        </div>

        <p className="text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} DotSkills. {c.rights}
        </p>
      </aside>

      {/* ================= Right: form ================= */}
      <section className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="lg:invisible">
            <Brand />
          </div>
          <LanguageSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-8">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
              {variant === "platform" && (
                <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {c.platformBadge}
                </span>
              )}
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
            </div>

            {children}

            {/* <p className="text-center text-sm text-muted-foreground">
              {variant === "company" ? c.switchCompany : c.switchPlatform}{" "}
              <Link
                href={variant === "company" ? "/platform/login" : "/login"}
                className="font-medium text-primary hover:underline"
              >
                {variant === "company" ? c.switchCompanyLink : c.switchPlatformLink}
              </Link>
            </p> */}
          </div>
        </div>

        <p className="pb-6 text-center text-xs text-muted-foreground lg:hidden">
          © {new Date().getFullYear()} DotSkills. {c.rights}
        </p>
      </section>
    </main>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "flex size-10 items-center justify-center rounded-xl text-lg font-bold",
          light ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground",
        ].join(" ")}
        aria-hidden="true"
      >
        D
      </div>
      <span className="text-lg font-semibold tracking-tight">DotSkills</span>
    </div>
  );
}
