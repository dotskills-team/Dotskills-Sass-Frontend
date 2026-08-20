"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RoleChecklist } from "@/components/shared/role-checklist";

import {
  createPlatformStaffSchema,
  type PlatformStaffFormValues,
} from "@/features/platform-staff/schemas/platform-staff.schema";
import { useListPlatformRolesQuery } from "@/features/platform-roles/api/platform-role.api";

interface PlatformStaffFormProps {
  defaultValues: PlatformStaffFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  /** Create-এ password required, edit-এ শুধু fullName/employeeCode profile field (`UpdatePlatformStaffDto`, verified) — role assignment দুই ক্ষেত্রেই থাকে, শুধু আলাদা endpoint (`PUT .../roles`) দিয়ে সংরক্ষিত হয়। */
  isCreate: boolean;
  roleCodes: string[];
  onRoleCodesChange: (next: string[]) => void;
  rolesError?: boolean;
  onCancel: () => void;
  onSubmit: (values: PlatformStaffFormValues) => void;
}

export function PlatformStaffForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  cancelLabel,
  isCreate,
  roleCodes,
  onRoleCodesChange,
  rolesError,
  onCancel,
  onSubmit,
}: PlatformStaffFormProps) {
  const t = useTranslations("platformStaff");
  const { data: roles } = useListPlatformRolesQuery();
  const activeRoles = (roles ?? []).filter((role) => role.status === "ACTIVE");

  const schema = createPlatformStaffSchema(
    {
      emailRequired: t("form.emailRequired"),
      emailInvalid: t("form.emailInvalid"),
      fullNameRequired: t("form.fullNameRequired"),
      fullNameLength: t("form.fullNameLength"),
      passwordRequired: t("form.passwordRequired"),
      passwordLength: t("form.passwordLength"),
      employeeCodeLength: t("form.employeeCodeLength"),
    },
    isCreate,
  );

  const form = useForm<PlatformStaffFormValues>({ resolver: zodResolver(schema), defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.email")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={!isCreate} placeholder={t("form.emailPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.fullName")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.fullNamePlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCreate && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.password")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder={t("form.passwordPlaceholder")} />
                </FormControl>
                <FormDescription>{t("form.passwordDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="employeeCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.employeeCode")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("form.employeeCodePlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>
            {t("form.roleCodes")} <span className="text-destructive">*</span>
          </FormLabel>
          <div className="mt-2">
            <RoleChecklist roles={activeRoles} value={roleCodes} onChange={onRoleCodesChange} />
          </div>
          {rolesError && <p className="mt-1 text-sm text-destructive">{t("form.roleCodesRequired")}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
