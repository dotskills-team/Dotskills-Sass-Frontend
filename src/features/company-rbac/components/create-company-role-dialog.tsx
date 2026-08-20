"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { PermissionChecklist } from "@/components/shared/permission-checklist";
import {
  createCompanyRoleSchema,
  type CompanyRoleFormValues,
} from "@/features/company-rbac/schemas/company-role.schema";
import {
  useCreateCompanyRoleMutation,
  useListCompanyPermissionsQuery,
} from "@/features/company-rbac/api/company-rbac.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";

const EMPTY_VALUES: CompanyRoleFormValues = { code: "", name: "", description: "" };

/** `CreateCompanyRoleDto.permissionCodes` — `@ArrayMinSize(1)`, তাই কমপক্ষে ১টা permission select করা লাগবে। */
export function CreateCompanyRoleDialog({ companyId }: { companyId: string }) {
  const t = useTranslations("companyRbac");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [permissionCodes, setPermissionCodes] = useState<string[]>([]);
  const [permissionsError, setPermissionsError] = useState(false);

  const { data: permissions } = useListCompanyPermissionsQuery(companyId);
  const [createRole, { isLoading }] = useCreateCompanyRoleMutation();

  const schema = createCompanyRoleSchema({
    codeRequired: t("roles.form.codeRequired"),
    codeLength: t("roles.form.codeLength"),
    nameRequired: t("roles.form.nameRequired"),
    nameLength: t("roles.form.nameLength"),
    descriptionLength: t("roles.form.descriptionLength"),
  });

  const form = useForm<CompanyRoleFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES });

  async function handleSubmit(values: CompanyRoleFormValues) {
    if (permissionCodes.length === 0) {
      setPermissionsError(true);
      return;
    }

    const result = await createRole({
      companyId,
      body: {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        permissionCodes,
      },
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("roles.form.createSuccess"));
    handleOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset(EMPTY_VALUES);
      setPermissionCodes([]);
      setPermissionsError(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.ROLE_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("roles.form.createTitle")}
          </Button>
        </DialogTrigger>
      </CompanyPermissionGate>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("roles.form.createTitle")}</DialogTitle>
          <DialogDescription>{t("roles.form.createDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("roles.form.code")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("roles.form.codePlaceholder")}
                        onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("roles.form.name")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("roles.form.namePlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("roles.form.description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t("roles.form.descriptionPlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>
                {t("roles.form.permissions")} <span className="text-destructive">*</span>
              </FormLabel>
              <div className="mt-2">
                <PermissionChecklist
                  permissions={permissions ?? []}
                  value={permissionCodes}
                  onChange={(next) => {
                    setPermissionCodes(next);
                    setPermissionsError(false);
                  }}
                />
              </div>
              {permissionsError && (
                <p className="mt-1 text-sm text-destructive">{t("roles.form.permissionsRequired")}</p>
              )}
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
