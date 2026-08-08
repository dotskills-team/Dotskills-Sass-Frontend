

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-lg shadow-lg shadow-blue-600/20">
              D
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                DotSkills
              </h1>
              <p className="text-xs text-slate-400">SaaS Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            System Online
          </div>
        </header>

        {/* Main */}
        <section className="flex flex-1 items-center justify-center py-20">
          <div className="w-full max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
              Business Management Platform
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to{" "}
              <span className="text-blue-500">DotSkills</span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              A powerful multi-company SaaS platform designed to manage
              businesses, teams, operations, subscriptions, and business
              workflows from one secure system.
            </p>

            {/* Cards */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-slate-700">

                <h3 className="font-semibold">Multi-Company</h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Manage multiple business workspaces from a single account.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-slate-700">

                <h3 className="font-semibold">Secure Access</h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Role-based access and permission management for your team.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-slate-700">

                <h3 className="font-semibold">Scalable</h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Built with a scalable architecture for growing businesses.
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-10">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500"
              >
                Access Platform
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} DotSkills. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
