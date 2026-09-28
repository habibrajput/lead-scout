"use client";

import { AlertCircle, Briefcase, Globe, GlobeLock, MapPin, Phone, Star, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOURCES } from "../constants/sources";
import type { SearchCriteria } from "../types/criteria.types";
import { BrandIcon } from "./brand-icon";

type QueryChipsProps = {
  criteria: SearchCriteria;
  onRemove: (patch: Partial<SearchCriteria>) => void;
};

/** Shows how the sentence was understood; filter chips can be removed. */
export function QueryChips({ criteria: c, onRemove }: QueryChipsProps) {
  const src = SOURCES[c.source];
  const isBusiness = src.kind === "business";

  return (
    <ul aria-label="Search understood as" className="flex flex-wrap items-center gap-1.5">
      <li className="mr-0.5 text-xs text-muted-foreground">Searching</li>
      <Chip>
        <BrandIcon icon={src.icon} className="size-3.5" />
        {src.label}
      </Chip>
      {c.category ? (
        <Chip icon={Briefcase}>{c.category}</Chip>
      ) : (
        <MissingChip>Business type</MissingChip>
      )}
      {c.location ? (
        <Chip icon={MapPin}>{c.location}</Chip>
      ) : src.locationRequired ? (
        <MissingChip>Location</MissingChip>
      ) : (
        <Chip icon={MapPin} muted>
          Anywhere
        </Chip>
      )}
      {isBusiness &&
        (c.website === "none" ? (
          <Chip icon={GlobeLock} tone="success" onRemove={() => onRemove({ website: "any" })}>
            No website
          </Chip>
        ) : (
          <Chip icon={Globe} muted>
            Any website
          </Chip>
        ))}
      {isBusiness && c.hasPhone && (
        <Chip icon={Phone} onRemove={() => onRemove({ hasPhone: false })}>
          Has phone
        </Chip>
      )}
      {isBusiness && src.hasReviewData && c.minRating > 0 && (
        <Chip icon={Star} onRemove={() => onRemove({ minRating: 0 })}>
          {c.minRating.toFixed(1)}+ rating
        </Chip>
      )}
    </ul>
  );
}

function Chip({
  icon: Icon,
  children,
  onRemove,
  muted,
  tone,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  onRemove?: () => void;
  muted?: boolean;
  tone?: "success";
}) {
  const label = typeof children === "string" ? children : undefined;
  return (
    <li
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-medium",
        muted
          ? "border-dashed border-border text-muted-foreground"
          : tone === "success"
            ? "border-success/25 bg-success/8 text-success"
            : "border-border bg-card text-foreground",
        onRemove && "pr-1",
      )}
    >
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={label ? `Remove ${label}` : "Remove filter"}
          className="-my-1 flex size-6 cursor-pointer items-center justify-center rounded text-current/70 transition-colors duration-150 hover:bg-foreground/5 hover:text-current focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </li>
  );
}

function MissingChip({ children }: { children: React.ReactNode }) {
  return (
    <li className="inline-flex h-7 items-center gap-1.5 rounded-md border border-dashed border-highlight/60 bg-highlight/8 px-2 text-xs font-medium text-amber-800">
      <AlertCircle className="size-3.5" aria-hidden />
      {children} missing
    </li>
  );
}
