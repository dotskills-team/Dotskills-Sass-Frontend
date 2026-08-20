"use client";

import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

export function StatusFilter({
  value,
  options,
  onChange,
}: {
  value: string | undefined;
  options: readonly string[];
  onChange: (value: string | undefined) => void;
}) {
  const t = useTranslations("common");

  return (
    <Select
      value={value ?? ALL_VALUE}
      onValueChange={(next) => onChange(next === ALL_VALUE ? undefined : next)}
    >
      <SelectTrigger className="w-44">
        <SelectValue placeholder={t("status")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{t("allStatuses")}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
