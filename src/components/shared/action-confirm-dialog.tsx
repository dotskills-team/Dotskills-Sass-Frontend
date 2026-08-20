"use client";

import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export interface ActionFieldConfig {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  requiredMessage?: string;
  minLengthMessage?: string;
  maxLengthMessage?: string;
  /** Edit-style dialogs (e.g. Plan Feature enabled/limits) pre-populate a field with the entity's current value. Omit for fresh-input fields (reason/valId/status) — defaults to "". */
  defaultValue?: string;
}

interface ActionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  isLoading: boolean;
  fields?: ActionFieldConfig[];
  onConfirm: (values: Record<string, string>) => void;
}

/**
 * একটাই reusable action-confirmation primitive (Industry দিয়ে
 * establish করা pattern) — Company/Plan/Subscription/Billing/
 * Invoice/Payment সবগুলো module এই একই component ব্যবহার করে।
 * `fields` না দিলে plain Confirm/Cancel; দিলে RHF+Zod দিয়ে validated
 * ছোট form রেন্ডার হয় (reason/status/valId ইত্যাদি)।
 *
 * এখানে কোনো business/status-transition logic নেই — শুধু UI
 * plumbing; mutation call, success/error toast, cache invalidation
 * সবই caller (per-module action component)-এর দায়িত্ব, যাতে backend-ই
 * সবসময় source of truth থাকে।
 */
export function ActionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  isLoading,
  fields,
  onConfirm,
}: ActionConfirmDialogProps) {
  const hasFields = !!fields && fields.length > 0;
  const schema = useMemo(() => buildSchema(fields), [fields]);

  const form = useForm<Record<string, string>>({
    resolver: hasFields
      ? (zodResolver(schema) as unknown as Resolver<Record<string, string>>)
      : undefined,
    defaultValues: buildDefaultValues(fields),
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaultValues(fields));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {hasFields ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-4" noValidate>
              {fields!.map((fieldConfig) => (
                <FormField
                  key={fieldConfig.name}
                  control={form.control}
                  name={fieldConfig.name}
                  render={({ field: rhfField }) => (
                    <FormItem>
                      <FormLabel>{fieldConfig.label}</FormLabel>
                      <FormControl>
                        {fieldConfig.type === "select" ? (
                          <Select value={rhfField.value} onValueChange={rhfField.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={fieldConfig.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldConfig.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : fieldConfig.type === "textarea" ? (
                          <Textarea {...rhfField} placeholder={fieldConfig.placeholder} />
                        ) : (
                          <Input {...rhfField} placeholder={fieldConfig.placeholder} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  {cancelLabel}
                </Button>
                <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={isLoading}>
                  {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  {confirmLabel}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={destructive ? "destructive" : "default"}
              disabled={isLoading}
              onClick={() => onConfirm({})}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function buildDefaultValues(fields?: ActionFieldConfig[]): Record<string, string> {
  if (!fields) return {};
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ""]));
}

function buildSchema(fields?: ActionFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (fields) {
    for (const field of fields) {
      let schema = z.string();

      if (field.required) {
        const min = field.minLength ?? 1;
        schema = schema.min(min, { error: field.minLengthMessage ?? field.requiredMessage });
      } else if (field.minLength) {
        schema = schema.min(field.minLength, { error: field.minLengthMessage });
      }

      if (field.maxLength) {
        schema = schema.max(field.maxLength, { error: field.maxLengthMessage });
      }

      shape[field.name] = field.required ? schema : schema.optional().or(z.literal(""));
    }
  }

  return z.object(shape);
}
