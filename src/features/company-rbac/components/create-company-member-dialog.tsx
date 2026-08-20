"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { RoleChecklist } from "@/components/shared/role-checklist";
import {
  createCompanyMemberSchema,
  type CompanyMemberFormValues,
} from "@/features/company-rbac/schemas/company-member.schema";
import {
  useCreateCompanyMemberMutation,
  useListCompanyRolesQuery,
} from "@/features/company-rbac/api/company-rbac.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";

const EMPTY_VALUES: CompanyMemberFormValues = {
  email: "",
  fullName: "",
  password: "",
  employeeCode: "",
  designation: "",
};

/** `CreateCompanyMemberDto.password` optional — existing user হলে password লাগে না (service-level rule, verified)। */
export function CreateCompanyMemberDialog({ companyId }: { companyId: string }) {
  const t = useTranslations("companyRbac");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [roleCodes, setRoleCodes] = useState<string[]>([]);
  const [rolesError, setRolesError] = useState(false);

  const { data: roles } = useListCompanyRolesQuery(companyId);
  const [createMember, { isLoading }] = useCreateCompanyMemberMutation();

  const schema = createCompanyMemberSchema({
    emailRequired: t("members.form.emailRequired"),
    emailInvalid: t("members.form.emailInvalid"),
    fullNameRequired: t("members.form.fullNameRequired"),
    fullNameLength: t("members.form.fullNameLength"),
    passwordLength: t("members.form.passwordLength"),
    employeeCodeLength: t("members.form.employeeCodeLength"),
    designationLength: t("members.form.designationLength"),
  });

  const form = useForm<CompanyMemberFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES });

  async function handleSubmit(values: CompanyMemberFormValues) {
    if (roleCodes.length === 0) {
      setRolesError(true);
      return;
    }

    const result = await createMember({
      companyId,
      body: {
        email: values.email.trim(),
        fullName: values.fullName.trim(),
        password: values.password?.trim() || undefined,
        employeeCode: values.employeeCode?.trim() || undefined,
        designation: values.designation?.trim() || undefined,
        roleCodes,
      },
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("members.form.createSuccess"));
    handleOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset(EMPTY_VALUES);
      setRoleCodes([]);
      setRolesError(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.MEMBER_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus aria-hidden="true" />
            {t("members.form.createTitle")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("members.form.createTitle")}</DialogTitle>
          <DialogDescription>{t("members.form.createDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("members.form.email")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder={t("members.form.emailPlaceholder")} />
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
                      {t("members.form.fullName")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("members.form.fullNamePlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("members.form.password")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder={t("members.form.passwordPlaceholder")} />
                  </FormControl>
                  <FormDescription>{t("members.form.passwordDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="employeeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("members.form.employeeCode")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("members.form.employeeCodePlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("members.form.designation")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("members.form.designationPlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>
                {t("members.form.roles")} <span className="text-destructive">*</span>
              </FormLabel>
              <div className="mt-2">
                <RoleChecklist
                  roles={roles ?? []}
                  value={roleCodes}
                  onChange={(next) => {
                    setRoleCodes(next);
                    setRolesError(false);
                  }}
                />
              </div>
              {rolesError && <p className="mt-1 text-sm text-destructive">{t("members.form.rolesRequired")}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {tCommon("create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
