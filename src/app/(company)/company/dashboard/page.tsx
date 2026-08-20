import type { Metadata } from "next";

import { UserGreeting } from "@/features/auth/components/user-greeting";

export const metadata: Metadata = {
  title: "Dashboard — DotSkills",
};

/**
 * Authentication foundation-এর জন্য minimal placeholder — real dashboard
 * একটা পরবর্তী, dedicated phase-এর কাজ (section 35)।
 */
export default function CompanyDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">Company Dashboard</h1>
      <UserGreeting />
    </div>
  );
}
