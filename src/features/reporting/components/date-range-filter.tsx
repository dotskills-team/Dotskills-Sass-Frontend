"use client";

import { CalendarDays, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Location } from "@/types/location";

export const ALL_LOCATIONS = "__all__";

/** Only `id`/`name` are ever rendered — a minimal shape so callers with a lighter location list (e.g. the Dashboard's scope) don't need the full `Location` type. */
type SelectableLocation = Pick<Location, "id" | "name">;

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  locationId: string;
  onLocationChange: (value: string) => void;
  locations: SelectableLocation[];
  /** Defaults to true (every existing call site keeps showing it) — pass false to hide the location Select entirely when a company has no locations at all. */
  showLocationFilter?: boolean;
  labels: {
    dateFrom: string;
    dateTo: string;
    locationPlaceholder: string;
    allLocations: string;
  };
}

/* UI ONLY — console look: quiet slate labels with blue icons, white controls, blue focus */
const FIELD = "flex w-full flex-col gap-1.5 sm:w-auto";
const LABEL_CLASS = "flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-muted-foreground";
const ICON_CLASS = "size-3.5 text-blue-600";
const CONTROL_BASE =
  "h-9 rounded-lg border-slate-200 bg-white text-sm shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-slate-300 focus-visible:border-blue-600 focus-visible:ring-blue-600/20 motion-reduce:transition-none dark:border-input dark:bg-background";

/**
 * No date-range-picker library/component exists anywhere in this codebase
 * (confirmed) — the established convention, set by Purchase Order's
 * `orderDate` field, is a plain native `<Input type="date">`. Reused by
 * Sale Register, Purchase Register, and Profit Report — the 3 reports
 * requiring a mandatory date range (Backend Phase 6's own rule: a
 * silently-defaulted date range is more dangerous than a loud validation
 * error for a financial figure).
 */
export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  locationId,
  onLocationChange,
  locations,
  showLocationFilter = true,
  labels,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className={FIELD}>
        <Label htmlFor="report-date-from" className={LABEL_CLASS}>
          <CalendarDays className={ICON_CLASS} aria-hidden="true" />
          {labels.dateFrom}
        </Label>
        <Input
          id="report-date-from"
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(event) => {
            // Calendar "Clear" gives "" — the API requires a valid ISO date, so keep the current one.
            if (event.target.value) onDateFromChange(event.target.value);
          }}
          className={`${CONTROL_BASE} w-full tabular-nums sm:w-40`}
        />
      </div>
      <div className={FIELD}>
        <Label htmlFor="report-date-to" className={LABEL_CLASS}>
          <CalendarDays className={ICON_CLASS} aria-hidden="true" />
          {labels.dateTo}
        </Label>
        <Input
          id="report-date-to"
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(event) => {
            // Calendar "Clear" gives "" — the API requires a valid ISO date, so keep the current one.
            if (event.target.value) onDateToChange(event.target.value);
          }}
          className={`${CONTROL_BASE} w-full tabular-nums sm:w-40`}
        />
      </div>
      {showLocationFilter && (
        <div className={FIELD}>
          <Label className={LABEL_CLASS}>
            <MapPin className={ICON_CLASS} aria-hidden="true" />
            {labels.locationPlaceholder}
          </Label>
          <Select value={locationId} onValueChange={onLocationChange}>
            <SelectTrigger className={`${CONTROL_BASE} w-full sm:w-56`}>
              <SelectValue placeholder={labels.locationPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LOCATIONS}>{labels.allLocations}</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

/** `yyyy-MM-dd` for exactly 30 days ago and today — the confirmed default range, user-changeable from there. */
export function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 30);
  return { dateFrom: toDateInputValue(from), dateTo: toDateInputValue(today) };
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}
