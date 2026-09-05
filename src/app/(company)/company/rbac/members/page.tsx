"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListCompanyMembersQuery } from "@/features/company-rbac/api/company-rbac.api";
import { CreateCompanyMemberDialog } from "@/features/company-rbac/components/create-company-member-dialog";
import { CompanyMemberRowActions } from "@/features/company-rbac/components/company-member-actions";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { cn } from "@/lib/utils";

/** Backend `GET .../rbac/members` unpaginated (verified) — পুরো list একবারেই আসে। */
export default function CompanyMembersPage() {
  return (
    <Suspense fallback={null}>
      <CompanyMembersPageContent />
    </Suspense>
  );
}

function CompanyMembersPageContent() {
  const t = useTranslations("companyRbac");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;
  const searchParams = useSearchParams();
  const highlightMemberId = searchParams.get("memberId");
  const highlightedRowRef = useRef<HTMLTableRowElement | null>(null);

  const { data: members, isLoading, error, refetch } = useListCompanyMembersQuery(companyId ?? "", {
    skip: !companyId,
  });

  useEffect(() => {
    if (highlightMemberId && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightMemberId, members]);

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.MEMBER_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("members.title")} description={t("members.description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">
          {companyId && <CreateCompanyMemberDialog companyId={companyId} />}
        </div>

        {!companyId || isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !members || members.length === 0 ? (
          <EmptyState title={t("members.empty")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{t("members.columns.member")}</TableHead>
                  <TableHead>{t("members.columns.roles")}</TableHead>
                  <TableHead>{t("members.columns.status")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member, index) => (
                  <TableRow
                    key={member.id}
                    ref={member.id === highlightMemberId ? highlightedRowRef : undefined}
                    className={cn(member.id === highlightMemberId && "bg-accent/50")}
                  >
                    <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{member.user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </TableCell>
                    <TableCell>
                      {member.roles.length > 0
                        ? member.roles.map((r) => r.companyRole.name).join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={member.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <CompanyMemberRowActions companyId={companyId} member={member} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </CompanyPermissionGate>
  );
}
