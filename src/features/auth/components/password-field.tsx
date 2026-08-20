"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PasswordFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  autoComplete?: string;
}

export function PasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  autoComplete,
}: PasswordFieldProps<TFieldValues>) {
  const t = useTranslations("auth");
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-0 right-0.5 h-full text-muted-foreground hover:bg-transparent"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? t("hidePassword") : t("showPassword")}
              >
                {visible ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
