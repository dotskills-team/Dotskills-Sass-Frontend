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
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { PermissionChecklist } from "@/components/shared/permission-checklist";
import {
  createPlatformRoleSchema,
  type PlatformRoleFormValues,
} from "@/features/platform-roles/schemas/platform-role.schema";
import {
  useCreatePlatformRoleMutation,
  useListPlatformPermissionsQuery,
} from "@/features/platform-roles/api/platform-role.api";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";

const EMPTY_VALUES: PlatformRoleFormValues = { code: "", name: "", description: "" };

/** `CreatePlatformRoleDto.permissionCodes` — `@ArrayMinSize(1)`, তাই কমপক্ষে ১টা permission select করা লাগবে। */
export function CreatePlatformRoleDialog() {
  const t = useTranslations("platformRoles");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [permissionCodes, setPermissionCodes] = useState<string[]>([]);
  const [permissionsError, setPermissionsError] = useState(false);

  const { data: permissions } = useListPlatformPermissionsQuery();
  const [createRole, { isLoading }] = useCreatePlatformRoleMutation();

  const schema = createPlatformRoleSchema({
    codeRequired: t("form.codeRequired"),
    codeLength: t("form.codeLength"),
    nameRequired: t("form.nameRequired"),
    nameLength: t("form.nameLength"),
    descriptionLength: t("form.descriptionLength"),
  });

  const form = useForm<PlatformRoleFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES });

  async function handleSubmit(values: PlatformRoleFormValues) {
    if (permissionCodes.length === 0) {
      setPermissionsError(true);
      return;
    }

    const result = await createRole({
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      permissionCodes,
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
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
      <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.ROLE_CREATE}>
        <DialogTrigger asChild>
          <Button>
            <Plus aria-hidden="true" />
            {t("form.createTitle")}
          </Button>
        </DialogTrigger>
      </PlatformPermissionGate>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("form.createTitle")}</DialogTitle>
          <DialogDescription>{t("form.createDescription")}</DialogDescription>
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
                      {t("form.code")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("form.codePlaceholder")}
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
                      {t("form.name")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("form.namePlaceholder")} />
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
                  <FormLabel>{t("form.description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t("form.descriptionPlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>
                {t("form.permissions")} <span className="text-destructive">*</span>
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
                <p className="mt-1 text-sm text-destructive">{t("form.permissionsRequired")}</p>
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
