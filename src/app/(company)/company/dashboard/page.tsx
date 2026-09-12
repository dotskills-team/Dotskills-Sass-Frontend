// import type { Metadata } from "next";

// import { UserGreeting } from "@/features/auth/components/user-greeting";
// import { SetupIncompleteBanner } from "@/features/setup-wizard/components/setup-incomplete-banner";

// export const metadata: Metadata = {
//   title: "Dashboard — DotSkills",
// };

// /**
//  * Authentication foundation-এর জন্য minimal placeholder — real dashboard
//  * একটা পরবর্তী, dedicated phase-এর কাজ (section 35)।
//  */
// export default function CompanyDashboardPage() {
//   return (
//     <div className="p-6">
//       <SetupIncompleteBanner />
//       <h1 className="text-2xl font-semibold text-foreground">Company Dashboard</h1>
//       <UserGreeting />
//     </div>
//   );
// }
import type { Metadata } from "next";

import { UserGreeting } from "@/features/auth/components/user-greeting";
import { SetupIncompleteBanner } from "@/features/setup-wizard/components/setup-incomplete-banner";

export const metadata: Metadata = {
  title: "Dashboard — DotSkills",
};

/* -------------------------------------------------------------------------- */
/*                               DUMMY DATA                                   */
/* -------------------------------------------------------------------------- */

const summaryCards = [
  {
    title: "Today's Sales",
    value: "৳82,450",
    change: "+12.5%",
    positive: true,
    icon: "৳",
    description: "vs yesterday",
  },
  {
    title: "Today's Orders",
    value: "248",
    change: "+8.2%",
    positive: true,
    icon: "🛒",
    description: "vs yesterday",
  },
  {
    title: "Today's Profit",
    value: "৳18,920",
    change: "+15.8%",
    positive: true,
    icon: "📈",
    description: "vs yesterday",
  },
  {
    title: "Today's Expense",
    value: "৳9,850",
    change: "-4.6%",
    positive: true,
    icon: "💸",
    description: "vs yesterday",
  },
  {
    title: "Cash Collected",
    value: "৳68,200",
    change: "+10.4%",
    positive: true,
    icon: "💵",
    description: "vs yesterday",
  },
];

const salesData = [
  { day: "Mon", value: 42000 },
  { day: "Tue", value: 58000 },
  { day: "Wed", value: 49000 },
  { day: "Thu", value: 71000 },
  { day: "Fri", value: 63000 },
  { day: "Sat", value: 82000 },
  { day: "Sun", value: 76450 },
];

const lowStockProducts = [
  {
    name: "Rice 5kg",
    sku: "RICE-005",
    stock: 5,
    unit: "pcs",
  },
  {
    name: "Soybean Oil 1L",
    sku: "OIL-001",
    stock: 2,
    unit: "pcs",
  },
  {
    name: "Salt 1kg",
    sku: "SALT-001",
    stock: 0,
    unit: "pcs",
  },
  {
    name: "Milk Powder 500g",
    sku: "MILK-500",
    stock: 4,
    unit: "pcs",
  },
];

const topProducts = [
  {
    rank: 1,
    name: "Rice 5kg",
    quantity: 185,
    sales: "৳46,250",
  },
  {
    rank: 2,
    name: "Soybean Oil 1L",
    quantity: 142,
    sales: "৳24,140",
  },
  {
    rank: 3,
    name: "Milk Powder 500g",
    quantity: 98,
    sales: "৳18,620",
  },
  {
    rank: 4,
    name: "Sugar 1kg",
    quantity: 86,
    sales: "৳10,320",
  },
];

const recentTransactions = [
  {
    type: "sale",
    title: "Sale #1024",
    description: "Cash Sale",
    amount: "৳2,500",
    time: "2 min ago",
  },
  {
    type: "payment",
    title: "Payment Received",
    description: "Customer payment",
    amount: "৳5,000",
    time: "18 min ago",
  },
  {
    type: "purchase",
    title: "Purchase #450",
    description: "Supplier purchase",
    amount: "৳20,000",
    time: "42 min ago",
  },
  {
    type: "expense",
    title: "Expense",
    description: "Electricity bill",
    amount: "৳1,000",
    time: "1 hour ago",
  },
];

const branches = [
  {
    name: "Main Branch",
    sales: "৳50,000",
    orders: 120,
    profit: "৳8,000",
  },
  {
    name: "Branch 2",
    sales: "৳30,000",
    orders: 80,
    profit: "৳5,000",
  },
  {
    name: "Branch 3",
    sales: "৳18,500",
    orders: 48,
    profit: "৳3,200",
  },
];

/* -------------------------------------------------------------------------- */
/*                              PAGE COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function CompanyDashboardPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Thursday, September 3, 2026</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Company Dashboard
            </h1>

            <div className="mt-1 text-sm text-muted-foreground">
              <UserGreeting />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted">
              📅 Today
            </button>

            <button className="rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted">
              Main Branch
            </button>

            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
              ↻ Refresh
            </button>
          </div>
        </div>

        <SetupIncompleteBanner />

        {/* ---------------------------------------------------------------- */}
        {/* SUMMARY CARDS                                                     */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {card.value}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                  {card.icon}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs">
                <span
                  className={
                    card.positive
                      ? "rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-600 dark:bg-emerald-950/30"
                      : "rounded-full bg-red-50 px-2 py-1 font-semibold text-red-600 dark:bg-red-950/30"
                  }
                >
                  {card.change}
                </span>

                <span className="text-muted-foreground">
                  {card.description}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SALES CHART + PROFIT                                               */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          {/* Sales Performance */}

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Sales Performance</h2>
                <p className="text-sm text-muted-foreground">
                  Sales overview for the last 7 days
                </p>
              </div>

              <div className="flex rounded-lg border bg-muted/30 p-1 text-xs">
                <button className="rounded-md bg-card px-3 py-1.5 font-medium shadow-sm">
                  7 Days
                </button>
                <button className="px-3 py-1.5 text-muted-foreground">
                  Month
                </button>
                <button className="px-3 py-1.5 text-muted-foreground">
                  Year
                </button>
              </div>
            </div>

            <div className="flex h-[280px] items-end gap-3 sm:gap-5">
              {salesData.map((item) => {
                const height = Math.round((item.value / 85000) * 100);

                return (
                  <div
                    key={item.day}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="mb-2 text-center text-[11px] font-medium text-muted-foreground">
                      ৳{Math.round(item.value / 1000)}k
                    </div>

                    <div className="relative flex flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-primary/80 transition-all hover:bg-primary"
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <div className="mt-3 text-center text-xs text-muted-foreground">
                      {item.day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profit Overview */}

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Profit Overview</h2>
              <p className="text-sm text-muted-foreground">
                Current month performance
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Gross Profit
                  </span>
                  <span className="font-semibold">৳245,800</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: "78%" }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Net Profit
                  </span>
                  <span className="font-semibold">৳184,200</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: "61%" }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Expenses</span>
                  <span className="font-semibold">৳61,600</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: "32%" }}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Profit Margin
                  </span>

                  <span className="text-xl font-bold text-emerald-600">
                    24.8%
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  +3.2% compared to last month
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* INVENTORY + ALERTS                                                */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-6 lg:grid-cols-2">
          {/* Inventory */}

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Inventory Overview</h2>
                <p className="text-sm text-muted-foreground">
                  Current inventory status
                </p>
              </div>

              <button className="text-sm font-medium text-primary hover:underline">
                View Inventory →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InventoryStat
                label="Products"
                value="1,248"
                icon="📦"
              />

              <InventoryStat
                label="Low Stock"
                value="24"
                icon="⚠️"
                danger
              />

              <InventoryStat
                label="Out of Stock"
                value="7"
                icon="🔴"
                danger
              />

              <InventoryStat
                label="Stock Value"
                value="৳8.4M"
                icon="💰"
              />
            </div>
          </div>

          {/* Alerts */}

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Important Alerts</h2>
                <p className="text-sm text-muted-foreground">
                  Needs your attention
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/30">
                4 Alerts
              </span>
            </div>

            <div className="space-y-3">
              <AlertRow
                icon="🔴"
                title="7 products are out of stock"
                description="Restock required"
              />

              <AlertRow
                icon="⚠️"
                title="24 products have low stock"
                description="Review inventory"
              />

              <AlertRow
                icon="💰"
                title="৳32,500 customer due"
                description="Collection required"
              />

              <AlertRow
                icon="🧾"
                title="3 overdue payments"
                description="Follow up with customers"
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* LOW STOCK + TOP PRODUCTS                                          */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-6 xl:grid-cols-2">
          {/* Low Stock */}

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Low Stock Products</h2>
                <p className="text-sm text-muted-foreground">
                  Products that need restocking
                </p>
              </div>

              <button className="text-sm font-medium text-primary hover:underline">
                View All →
              </button>
            </div>

            <div className="divide-y">
              {lowStockProducts.map((product) => (
                <div
                  key={product.sku}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      📦
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {product.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    </div>
                  </div>

                  <span
                    className={
                      product.stock === 0
                        ? "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/30"
                        : "rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-950/30"
                    }
                  >
                    {product.stock === 0
                      ? "Out of Stock"
                      : `${product.stock} ${product.unit} left`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Top Selling Products
              </h2>

              <p className="text-sm text-muted-foreground">
                Best performing products this month
              </p>
            </div>

            <div className="space-y-3">
              {topProducts.map((product) => (
                <div
                  key={product.rank}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {product.rank}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {product.quantity} units sold
                    </p>
                  </div>

                  <span className="text-sm font-semibold">
                    {product.sales}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CUSTOMER + SUPPLIER                                               */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryMiniCard
            title="Total Customers"
            value="2,485"
            description="+124 this month"
            icon="👥"
          />

          <SummaryMiniCard
            title="Customer Due"
            value="৳32,500"
            description="18 customers"
            icon="💰"
          />

          <SummaryMiniCard
            title="Total Suppliers"
            value="184"
            description="12 active suppliers"
            icon="🚚"
          />

          <SummaryMiniCard
            title="Supplier Payable"
            value="৳145,800"
            description="24 pending invoices"
            icon="🧾"
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* BRANCH PERFORMANCE                                                */}
        {/* ---------------------------------------------------------------- */}

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Branch Performance</h2>

            <p className="text-sm text-muted-foreground">
              Compare your business branches
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="pb-3 font-medium">Branch</th>
                  <th className="pb-3 font-medium">Sales</th>
                  <th className="pb-3 font-medium">Orders</th>
                  <th className="pb-3 font-medium">Profit</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {branches.map((branch) => (
                  <tr key={branch.name}>
                    <td className="py-4 font-medium">
                      {branch.name}
                    </td>

                    <td className="py-4">{branch.sales}</td>

                    <td className="py-4">{branch.orders}</td>

                    <td className="py-4 font-semibold text-emerald-600">
                      {branch.profit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* RECENT TRANSACTIONS                                               */}
        {/* ---------------------------------------------------------------- */}

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Recent Transactions
              </h2>

              <p className="text-sm text-muted-foreground">
                Latest business activities
              </p>
            </div>

            <button className="text-sm font-medium text-primary hover:underline">
              View All →
            </button>
          </div>

          <div className="divide-y">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.title}
                className="flex items-center gap-3 py-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {transaction.type === "sale" && "🛒"}
                  {transaction.type === "payment" && "💰"}
                  {transaction.type === "purchase" && "📦"}
                  {transaction.type === "expense" && "💸"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {transaction.title}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {transaction.description} · {transaction.time}
                  </p>
                </div>

                <span className="text-sm font-semibold">
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SMALL COMPONENTS                              */
/* -------------------------------------------------------------------------- */

function InventoryStat({
  label,
  value,
  icon,
  danger = false,
}: {
  label: string;
  value: string;
  icon: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-2 text-lg">{icon}</div>

      <p
        className={
          danger
            ? "text-xl font-bold text-red-600"
            : "text-xl font-bold"
        }
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function AlertRow({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="text-lg">{icon}</div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>

        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <button className="text-xs font-medium text-primary hover:underline">
        View
      </button>
    </div>
  );
}

function SummaryMiniCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>

        <span className="text-xs text-muted-foreground">
          This month
        </span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">{value}</p>

      <p className="mt-2 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}