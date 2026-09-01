"use client";

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

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  locationId: string;
  onLocationChange: (value: string) => void;
  locations: Location[];
  labels: {
    dateFrom: string;
    dateTo: string;
    locationPlaceholder: string;
    allLocations: string;
  };
}

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
  labels,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="report-date-from">{labels.dateFrom}</Label>
        <Input
          id="report-date-from"
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(event) => onDateFromChange(event.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="report-date-to">{labels.dateTo}</Label>
        <Input
          id="report-date-to"
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(event) => onDateToChange(event.target.value)}
          className="w-40"
        />
      </div>
      <Select value={locationId} onValueChange={onLocationChange}>
        <SelectTrigger className="w-56">
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
