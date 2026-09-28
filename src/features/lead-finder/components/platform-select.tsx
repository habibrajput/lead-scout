"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  SOURCE_LIST,
  type SourceAvailability,
  type SourceId,
  SOURCES,
  UPCOMING_SOURCES,
} from "../constants/sources";
import { BrandIcon } from "./brand-icon";

type PlatformSelectProps = {
  value: SourceId;
  onChange: (source: SourceId) => void;
  availability: SourceAvailability;
};

function statusFor(id: SourceId, availability: SourceAvailability) {
  if (SOURCES[id].envVars.length === 0) return { label: "Free", live: true };
  return availability[id].live ? { label: "Live", live: true } : { label: "Demo", live: false };
}

/** Compact platform dropdown that sits inside the search bar. */
export function PlatformSelect({ value, onChange, availability }: PlatformSelectProps) {
  const current = SOURCES[value];

  return (
    <Select
      items={SOURCE_LIST.map((s) => ({ value: s.id, label: s.label }))}
      value={value}
      onValueChange={(v) => v && onChange(v as SourceId)}
    >
      <SelectTrigger
        aria-label={`Platform: ${current.label}`}
        className="h-full shrink-0 gap-2 rounded-none rounded-l-xl border-0 border-r border-border bg-muted/40 px-3 shadow-none hover:bg-muted focus-visible:ring-0 focus-visible:bg-muted data-[size=default]:h-full sm:px-3.5"
      >
        <BrandIcon icon={current.icon} className="size-4" />
        <span className="hidden text-sm font-medium sm:inline">{current.label}</span>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false} className="min-w-64 p-1">
        <SelectGroup>
          <SelectLabel>Search on</SelectLabel>
          {SOURCE_LIST.map((s) => {
            const status = statusFor(s.id, availability);
            return (
              <SelectItem key={s.id} value={s.id} className="py-2">
                <BrandIcon icon={s.icon} className="size-4" />
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 font-medium">
                    {s.label}
                    <StatusTag label={status.label} live={status.live} />
                  </span>
                  <span className="text-xs text-muted-foreground">{s.tagline}</span>
                </span>
              </SelectItem>
            );
          })}
          {UPCOMING_SOURCES.map((s) => (
            <SelectItem key={s.label} value={`soon:${s.label}`} disabled className="py-2">
              <BrandIcon icon={s.icon} className="size-4 grayscale" />
              <span className="flex flex-col">
                <span className="flex items-center gap-2 font-medium">
                  {s.label}
                  <StatusTag label="Soon" live={false} muted />
                </span>
                <span className="text-xs text-muted-foreground">{s.tagline}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function StatusTag({ label, live, muted }: { label: string; live: boolean; muted?: boolean }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase",
        muted
          ? "border border-border text-muted-foreground"
          : live
            ? "bg-success/10 text-success"
            : "bg-highlight/15 text-amber-800",
      )}
    >
      {label}
    </span>
  );
}
