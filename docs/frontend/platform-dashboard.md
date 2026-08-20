# Platform Dashboard (Phase 4)

Professional, read-only Platform Admin dashboard built on top of the
existing Phase 0–3 architecture (auth BFF, RTK Query `baseApi`, RBAC,
i18n, shadcn/ui). No new architecture was introduced — this phase only
adds feature slices, pages, and shared UI primitives that follow the
existing patterns.

## Architecture

```
(platform)/layout.tsx        AuthGate → ScopeGuard("platform") → header + AppSidebar
  platform/dashboard/page.tsx   6 real StatCards, no mock data
  platform/companies/page.tsx   search + DataTable + pagination
  platform/industries/page.tsx  search + DataTable + pagination
  platform/plans/page.tsx       search + DataTable + pagination
  platform/subscriptions/page.tsx  DataTable only (no search/pagination — see Known limitations)
  platform/billing/page.tsx     search + StatusFilter + DataTable + pagination
  platform/invoices/page.tsx    search + StatusFilter + DataTable + pagination
  platform/payments/page.tsx    StatusFilter + DataTable + pagination (no search — backend has none)
```

`ScopeGuard` and the httpOnly-refresh-cookie + memory-access-token BFF
pattern are unchanged from Phase 1/2 — this phase only consumes them.

## Route structure

| Route | Permission | Notes |
|---|---|---|
| `/platform/dashboard` | none (always visible) | real backend counts only |
| `/platform/companies` | `platform.company.read` | search + status + industry filter (industry filter UI not yet added, backend supports it) |
| `/platform/industries` | `platform.industry.read` | search + status |
| `/platform/plans` | `platform.plan.read` | search + status; price intentionally not shown (see Known limitations) |
| `/platform/subscriptions` | `subscription:read` | no filters (backend doesn't support any) |
| `/platform/billing` | `billing.read` | search + status |
| `/platform/invoices` | `invoice.read` | search + status + date range (UI for date range not yet added) |
| `/platform/payments` | `payment.read` | status only (no `search` field on `QueryPaymentDto`) |

`nav-items.ts` is a flat array so future items (`settings`, `audit-logs`,
`users`, `reports`) are a one-line addition, not a structural change.

## API mapping & envelope normalization

Backend list endpoints return **four different shapes** for the same
concept (verified against controllers/services, not assumed):

| Endpoint | Shape | Normalizer |
|---|---|---|
| `GET /platform/companies` | `{ items, meta }` | `normalizeItemsEnvelope` |
| `GET /platform/billings` | `{ items, meta }` | `normalizeItemsEnvelope` |
| `GET /platform/invoices` | `{ items, meta }` | `normalizeItemsEnvelope` |
| `GET /platform/payments` | `{ items, meta }` | `normalizeItemsEnvelope` |
| `GET /platform/industries` | `{ data, meta }` | `normalizeDataEnvelope` |
| `GET /plans` (no `/platform` prefix) | `{ success, message, data, meta }` | `normalizeSuccessEnvelope` |
| `GET /platform/subscriptions` | raw array, no envelope, capped at 100 rows, no query params accepted | `normalizeRawArray` |

All four normalizers live in `src/types/list-result.ts` and are plain,
independently unit-tested functions (`list-result.test.ts`) reused
directly as each endpoint's `transformResponse` — this is a
presentation-layer adaptation only; no backend data is altered or
invented.

## RTK Query cache strategy

- Single `baseApi` singleton (`src/store/api/base-api.ts`); every new
  endpoint is added via `injectEndpoints` in `features/<name>/api/`.
- No new `tagTypes` were needed — these are all platform-admin
  read-only list views with no mutations in this phase, so no
  invalidation wiring was required.
- Dashboard stat cards intentionally use `limit: 1` queries purely to
  cheaply read `meta.total` without fetching row data.

## Permission mapping

Every nav item and every page's `PlatformPermissionGate` uses an exact
`PLATFORM_PERMISSIONS` constant — never a string literal. Verified
against a real `POST /auth/staff/login` response's `permissions[]`
array for a `SUPER_ADMIN` account; all seven codes used by this phase
(`platform.company.read`, `platform.industry.read`,
`platform.plan.read`, `subscription:read`, `billing.read`,
`invoice.read`, `payment.read`) exist verbatim in the backend response.
Covered by `nav-items.test.ts`.

Permission gating is UX-only. The backend is the actual authorization
boundary — confirmed live (see Security section).

## Table architecture

`@tanstack/react-table` is pinned at `^9.1.2`, whose API is materially
different from the commonly-known v8 API (`useTable` instead of
`useReactTable`, `ColumnDef<TFeatures, TData, TValue>` with `TFeatures`
first, `tableFeatures({})` instead of `getCoreRowModel()`,
`row.getAllCells()` instead of `row.getVisibleCells()`). A single
shared `appTableFeatures = tableFeatures({})` (core row model only —
every table here does server-side sort/filter/paginate via RTK Query
params, so no client-side feature is registered) lives in
`components/data-table/table-features.ts` and is imported by both
`DataTable` and every column-def file so the `TFeatures` generic
matches everywhere.

`DataTable` is the single reusable primitive for all 7 resource pages;
each page only supplies its own `columns` array and RTK Query
`data`/`isLoading`/`error`.

## Loading / error / empty states

- Loading: `DataTableSkeleton` (row-shaped skeleton, not a spinner).
- Error: `ErrorState` with a `Retry` button wired to RTK Query's
  `refetch`.
- Empty: `EmptyState` inside `DataTable` when `data.length === 0`.
- Permission denied: `PermissionDenied`, rendered by each page's
  `PlatformPermissionGate` fallback.

## i18n

Every visible string comes from `messages/{en,bn}/<namespace>.json`
(`dashboard`, `companies`, `industries`, `plans`, `subscriptions`,
`billing`, `invoices`, `payments`, plus additions to `common`). No
hardcoded UI text. `MESSAGE_NAMESPACES` in `src/i18n/request.ts` was
extended to include all eight new namespaces.

## Responsive behavior

Layout uses flex/grid with Tailwind breakpoints; the shared `Table`
primitive wraps in a horizontally-scrollable container so wide tables
don't break mobile layout. No dedicated mobile card view was built —
this phase relies on horizontal scroll, matching the "no premature
abstraction" rule; a card-based mobile view can be added later if
usage shows it's needed.

## Security

Live-verified this session against a running backend + frontend
(details in the Phase 4 verification report), not just read from code:

- `proxy.ts` redirects unauthenticated requests to `/platform/*` to
  `/login?redirectTo=...` (cookie-presence check only — it cannot
  decode scope from the refresh token, which carries no role/scope
  claims).
- `ScopeGuard` (client-side) redirects an authenticated but
  wrong-scope user to `/unauthorized`.
- **Backend is the real boundary in both directions**, confirmed live:
  a company-scoped user calling `GET /platform/companies` gets `403
  Forbidden`; a platform-staff user calling a company-scoped endpoint
  (`GET /invoices`) without `x-company-id` gets `400`, and even with a
  spoofed `x-company-id` header gets `403`.
- `x-company-id` header injection in `base-api.ts` is driven solely by
  `currentCompanyId` in the `company` Redux slice, which is only ever
  set by `switchCompany()` — an action dispatched exclusively from
  company-scoped UI that a platform session's `ScopeGuard` never lets
  it reach. No code change was made here (the existing mechanism is
  already leak-safe); this is a documented verification, not a fix.

## Testing

9 test files / 56 tests (frontend), including 3 added this phase:

- `src/types/list-result.test.ts` — the 4 envelope normalizers.
- `src/components/shared/status-badge.test.ts` — `getStatusTone`
  mapping for every real backend enum value across all 5 domains.
- `src/app/(platform)/nav-items.test.ts` — every gated nav item uses
  an exact `PLATFORM_PERMISSIONS` code; no duplicate routes; only
  Dashboard is ungated.

Backend: added `query-billing.dto.spec.ts`, `query-invoice.dto.spec.ts`,
`query-payment.dto.spec.ts` as regression tests for the pagination fix
(see Known limitations / bugs fixed in the verification report).

## Known limitations (disclosed, not hidden)

- **Subscriptions page has no search/pagination UI** — the backend's
  `GET /platform/subscriptions` accepts no query parameters and always
  returns (unpaginated) up to 100 rows. Building filter/pagination
  controls that don't actually filter or paginate would be a fake UI,
  so none were added.
- **Dashboard "Active Subscriptions" stat** is computed client-side by
  filtering that same capped 100-row snapshot for `status === "ACTIVE"`
  — it is the count within the most recent 100 subscriptions, not a
  true platform-wide total. This is disclosed in-UI (a caveat line
  under the stat grid) and in `messages/*/dashboard.json`
  (`activeSubscriptionsCaveat`), not presented as authoritative.
- **Plan list omits price** — `GET /plans` intentionally excludes
  price rows from its list response (`select` only returns
  `_count.prices`); fetching each plan's price individually via
  `GET /plans/:id/prices` would be an N+1 pattern, so price is left
  out of the list table pending a dedicated plan-detail page.
- **Company/date-range filters not yet wired in the UI** — the backend
  supports `industryId` on companies and `dateFrom`/`dateTo` on
  invoices; the RTK Query params already accept them, but no filter
  control has been built for either yet.
- **No mobile card view for tables** — horizontal scroll only.
