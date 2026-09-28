"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RATING_STEPS } from "../constants/criteria.constants";
import { SOURCES } from "../constants/sources";
import type { SearchCriteria, WebsiteFilter } from "../types/criteria.types";

const RATING_ITEMS = [
  { value: "0", label: "Any rating" },
  ...RATING_STEPS.map((r) => ({ value: String(r), label: `${r.toFixed(1)}+` })),
];

type FiltersPopoverProps = {
  criteria: SearchCriteria;
  onChange: (patch: Partial<SearchCriteria>) => void;
};

export function activeFilterCount(c: SearchCriteria) {
  const src = SOURCES[c.source];
  if (src.kind !== "business") return 0;
  return (
    (c.website === "none" ? 1 : 0) + (c.hasPhone ? 1 : 0) + (src.hasReviewData && c.minRating > 0 ? 1 : 0)
  );
}

/** The structured "advanced" options — mirrors what the sentence can express. */
export function FiltersPopover({ criteria, onChange }: FiltersPopoverProps) {
  const src = SOURCES[criteria.source];
  const count = activeFilterCount(criteria);
  const disabled = src.kind !== "business";

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-9 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
            aria-label={`Filters${count ? `, ${count} active` : ""}`}
          />
        }
      >
        <SlidersHorizontal aria-hidden />
        <span className="hidden md:inline">Filters</span>
        {count > 0 && (
          <span className="flex size-4.5 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-semibold text-primary-foreground">
            {count}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-80 gap-0 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Filters</p>
          <p className="text-xs text-muted-foreground">
            {disabled
              ? `${src.label} finds posts, so business filters don't apply.`
              : "You can also just type these, e.g. “with phone, rated 4+”."}
          </p>
        </div>

        <div className={cn("flex flex-col gap-4 p-4", disabled && "pointer-events-none opacity-50")}>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Website</span>
            <div role="radiogroup" aria-label="Website" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(
                [
                  ["none", "No website"],
                  ["any", "Any"],
                ] as [WebsiteFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={criteria.website === value}
                  onClick={() => onChange({ website: value })}
                  className={cn(
                    "h-8 cursor-pointer rounded-md text-sm font-medium transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                    criteria.website === value
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm">
              Has a phone number
              <span className="block text-xs text-muted-foreground">So you can call or WhatsApp them</span>
            </span>
            <Switch checked={criteria.hasPhone} onCheckedChange={(v) => onChange({ hasPhone: v })} />
          </label>

          <div className={cn("flex items-center justify-between gap-3", !src.hasReviewData && "opacity-50")}>
            <span className="text-sm">
              Minimum rating
              {!src.hasReviewData && (
                <span className="block text-xs text-muted-foreground">Not available on {src.label}</span>
              )}
            </span>
            <Select
              items={RATING_ITEMS}
              value={String(src.hasReviewData ? criteria.minRating : 0)}
              onValueChange={(v) => onChange({ minRating: Number(v ?? 0) })}
              disabled={!src.hasReviewData}
            >
              <SelectTrigger className="h-8 min-w-28" aria-label="Minimum rating">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {RATING_ITEMS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
