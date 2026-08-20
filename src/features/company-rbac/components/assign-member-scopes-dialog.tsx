"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReplaceCompanyMemberScopesMutation } from "@/features/company-rbac/api/company-rbac.api";
import { normalizeApiError } from "@/lib/api-error";
import type { CompanyMember, CompanyScopeType } from "@/types/company-rbac";

interface AssignMemberScopesDialogProps {
  companyId: string;
  member: CompanyMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SCOPE_TYPES: CompanyScopeType[] = ["COMPANY", "BRANCH", "WAREHOUSE", "POS_COUNTER"];

interface ScopeRow {
  type: CompanyScopeType;
  key: string;
}

/**
 * Backend rule (verified company-rbac.service.ts): `type: "COMPANY"`-এর `key` অবশ্যই `"*"`
 * হতে হবে, নাহলে `BadRequestException`। এই UI সেই ক্ষেত্রে key input auto-lock করে `*` দেখায়
 * — client-side নতুন rule invent না করে backend-এর existing validation-ই আগে থেকে reflect করা।
 */
export function AssignMemberScopesDialog({ companyId, member, open, onOpenChange }: AssignMemberScopesDialogProps) {
  const t = useTranslations("companyRbac");
  const tCommon = useTranslations("common");
  const [replaceScopes, { isLoading }] = useReplaceCompanyMemberScopesMutation();

  const [rows, setRows] = useState<ScopeRow[]>(() =>
    member.scopes.length > 0
      ? member.scopes.map((s) => ({ type: s.scopeType, key: s.scopeKey }))
      : [{ type: "COMPANY", key: "*" }],
  );

  function updateRow(index: number, patch: Partial<ScopeRow>) {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, ...patch };
        if (next.type === "COMPANY") next.key = "*";
        return next;
      }),
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    const scopes = rows.filter((row) => row.key.trim().length > 0);
    if (scopes.length === 0) {
      toast.error(t("members.form.scopesRequired"));
      return;
    }

    const result = await replaceScopes({
      companyId,
      memberId: member.id,
      scopes: scopes.map((row) => ({ type: row.type, key: row.key.trim() })),
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("members.actions.assignScopesSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("members.actions.assignScopesTitle")}</DialogTitle>
          <DialogDescription>
            {t("members.actions.assignScopesDescription", { name: member.user.fullName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select value={row.type} onValueChange={(value) => updateRow(index, { type: value as CompanyScopeType })}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="flex-1"
                value={row.key}
                disabled={row.type === "COMPANY"}
                placeholder={t("members.form.scopeKeyPlaceholder")}
                onChange={(event) => updateRow(index, { key: event.target.value })}
              />
              <Button variant="ghost" size="icon-sm" onClick={() => removeRow(index)} aria-label={tCommon("cancel")}>
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRows((prev) => [...prev, { type: "BRANCH", key: "" }])}
          >
            <Plus aria-hidden="true" />
            {t("members.form.addScope")}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
