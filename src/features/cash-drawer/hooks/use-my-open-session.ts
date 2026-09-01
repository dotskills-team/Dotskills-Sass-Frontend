import { useAppSelector } from "@/store/hooks";
import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListCashDrawerSessionsQuery } from "@/features/cash-drawer/api/cash-drawer.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

/**
 * The cheap "?status=OPEN&cashierId=self&limit=1" check shared by the
 * header indicator, the POS nudge banner, and the Cash Drawer page's own
 * open/close state — one source of truth, not three separate queries
 * with slightly different shapes.
 *
 * Skips entirely (never fires the query) when the user lacks
 * CASH_DRAWER_SESSION_READ — without this, a role that can't use this
 * feature would still hit a 403 on every page load, and `session` would
 * silently resolve to `null` regardless of any real open session,
 * incorrectly implying "you can open one" instead of "you don't have
 * access."
 */
export function useMyOpenSession(companyId: string | undefined) {
  const userId = useAppSelector((state) => state.auth.user?.userId);
  const { permissions } = useCurrentCompany();
  const canRead = permissions.includes(COMPANY_PERMISSIONS.CASH_DRAWER_SESSION_READ);

  const { data, isLoading, isFetching, refetch } = useListCashDrawerSessionsQuery(
    { companyId: companyId ?? "", status: "OPEN", cashierId: userId, limit: 1 },
    { skip: !companyId || !userId || !canRead },
  );

  return { session: data?.items[0] ?? null, isLoading, isFetching, refetch };
}
