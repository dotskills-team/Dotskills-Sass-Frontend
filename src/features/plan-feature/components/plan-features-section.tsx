"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { ActionConfirmDialog } from "@/components/shared/action-confirm-dialog";
import {
  useListPlanFeaturesQuery,
  useRemovePlanFeatureMutation,
} from "@/features/plan-feature/api/plan-feature.api";
import { useListFeaturesQuery } from "@/features/feature/api/feature.api";
import { AssignPlanFeatureDialog } from "@/features/plan-feature/components/assign-plan-feature-dialog";
import { EditPlanFeatureDialog } from "@/features/plan-feature/components/edit-plan-feature-dialog";
import { formatLimitsSummary } from "@/features/plan-feature/lib/plan-feature-form-mapper";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { PlanFeatureAssignment } from "@/types/platform";

type ActiveAction = { type: "assign" | "edit" | "remove"; assignment?: PlanFeatureAssignment } | null;

/**
 * Plan Details page-এর Features section। Feature নিজে master entity
 * (একাধিক Plan-এ reuse হয়) — এখানে নতুন Feature তৈরি করা হয় না, শুধু
 * existing ACTIVE Feature-কে এই Plan-এর সাথে assign করা হয়
 * (`assign-plan-feature.dto.ts` অনুযায়ী)।
 */
export function PlanFeaturesSection({ planId }: { planId: string }) {
  const t = useTranslations("planFeatures");
  const tCommon = useTranslations("common");
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const { data: assignments, isLoading, error, refetch } = useListPlanFeaturesQuery(planId);
  const { data: allFeatures } = useListFeaturesQuery({ status: "ACTIVE" });

  const [remove, { isLoading: isRemoving }] = useRemovePlanFeatureMutation();

  const assignedFeatureIds = new Set((assignments ?? []).map((a) => a.featureId));
  const availableFeatures = (allFeatures?.items ?? []).filter((f) => !assignedFeatureIds.has(f.id));

  async function handleRemove() {
    if (!activeAction?.assignment) return;

    const result = await remove({ planId, featureId: activeAction.assignment.featureId });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }
    toast.success(t("actions.removeSuccess"));
    setActiveAction(null);
  }

  return (
    <section className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-heading text-base font-medium text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_FEATURE_ASSIGN}>
          <Button size="sm" onClick={() => setActiveAction({ type: "assign" })}>
            {t("form.assignTitle")}
          </Button>
        </PlatformPermissionGate>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !assignments || assignments.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t("columns.feature")}</TableHead>
                <TableHead>{t("columns.module")}</TableHead>
                <TableHead>{t("columns.enabled")}</TableHead>
                <TableHead>{t("columns.limits")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment, index) => (
                <TableRow key={assignment.featureId}>
                  <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">{assignment.feature.name}</p>
                    <p className="text-xs text-muted-foreground">{assignment.feature.code}</p>
                  </TableCell>
                  <TableCell>{assignment.feature.module}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={assignment.enabled ? "text-success" : "text-muted-foreground"}>
                      {assignment.enabled ? t("enabled") : t("disabled")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {formatLimitsSummary(assignment.limits, assignment.feature.configSchema, {
                      yes: t("form.yes"),
                      no: t("form.no"),
                    }) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={tCommon("actions")}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_FEATURE_UPDATE}>
                          <DropdownMenuItem onSelect={() => setActiveAction({ type: "edit", assignment })}>
                            {tCommon("update")}
                          </DropdownMenuItem>
                        </PlatformPermissionGate>
                        <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_FEATURE_REMOVE}>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setActiveAction({ type: "remove", assignment })}
                          >
                            {t("actions.remove")}
                          </DropdownMenuItem>
                        </PlatformPermissionGate>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AssignPlanFeatureDialog
        planId={planId}
        availableFeatures={availableFeatures}
        open={activeAction?.type === "assign"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />

      {activeAction?.type === "edit" && activeAction.assignment && (
        <EditPlanFeatureDialog
          planId={planId}
          assignment={activeAction.assignment}
          open
          onOpenChange={(open) => !open && setActiveAction(null)}
        />
      )}

      <ActionConfirmDialog
        open={activeAction?.type === "remove"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title={t("actions.removeTitle")}
        description={
          activeAction?.assignment
            ? t("actions.removeDescription", { name: activeAction.assignment.feature.name })
            : undefined
        }
        confirmLabel={tCommon("confirm")}
        cancelLabel={tCommon("cancel")}
        destructive
        isLoading={isRemoving}
        onConfirm={handleRemove}
      />
    </section>
  );
}
