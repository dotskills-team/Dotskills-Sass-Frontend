"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdatePlatformRoleMutation } from "@/features/platform-roles/api/platform-role.api";
import { normalizeApiError } from "@/lib/api-error";
import type { PlatformRole } from "@/types/platform-role";

interface EditPlatformRoleDialogProps {
  role: PlatformRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** `UpdatePlatformRoleDto`-তে শুধু name/description — code immutable (verified)। */
export function EditPlatformRoleDialog({ role, open, onOpenChange }: EditPlatformRoleDialogProps) {
  const t = useTranslations("platformRoles");
  const tCommon = useTranslations("common");
  const [updateRole, { isLoading }] = useUpdatePlatformRoleMutation();

  const schema = z.object({
    name: z.string().min(2, { error: t("form.nameLength") }).max(120, { error: t("form.nameLength") }),
    description: z.string().max(1000, { error: t("form.descriptionLength") }).optional().or(z.literal("")),
  });

  const form = useForm<{ name: string; description?: string }>({
    resolver: zodResolver(schema),
    defaultValues: { name: role.name, description: role.description ?? "" },
  });

  async function handleSubmit(values: { name: string; description?: string }) {
    const result = await updateRole({
      id: role.id,
      body: { name: values.name.trim(), description: values.description?.trim() || undefined },
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.editSuccess"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("form.editTitle")}</DialogTitle>
          <DialogDescription>{t("form.editDescription", { name: role.name })}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.name")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {tCommon("update")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
