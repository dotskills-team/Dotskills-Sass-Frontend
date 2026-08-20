import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default async function Home() {
  const t = await getTranslations();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-lg text-primary-foreground">
              D
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{t("app.name")}</h1>
              <p className="text-xs text-muted-foreground">SaaS Platform</p>
            </div>
          </div>

          <LanguageSwitcher />
        </header>

        <section className="flex flex-1 items-center justify-center py-20">
          <div className="w-full max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              Business Management Platform
            </div>

            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to <span className="text-primary">DotSkills</span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              A powerful multi-company SaaS platform designed to manage businesses, teams,
              operations, subscriptions, and business workflows from one secure system.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <FeatureCard
                title="Multi-Company"
                description="Manage multiple business workspaces from a single account."
              />
              <FeatureCard
                title="Secure Access"
                description="Role-based access and permission management for your team."
              />
              <FeatureCard
                title="Scalable"
                description="Built with a scalable architecture for growing businesses."
              />
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/login">Access Platform</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Super Admin Login</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DotSkills. All rights reserved.
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-left transition hover:border-foreground/20">
      <h3 className="font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
