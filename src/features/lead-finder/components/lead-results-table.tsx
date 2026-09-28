"use client";

import { ChevronRight, MapPin } from "lucide-react";
import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Lead } from "../types/lead.types";
import { LeadRowActions } from "./lead-actions";
import { LeadScoreBadge } from "./lead-score-badge";
import { StarRating } from "./star-rating";
import { WebsiteStatus } from "./website-status";

type LeadResultsTableProps = {
  leads: Lead[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  onOpen: (lead: Lead) => void;
  /** Hide the rating column for sources without review data. */
  showRating: boolean;
};

export function LeadResultsTable({
  leads,
  selected,
  onToggle,
  onToggleAll,
  allSelected,
  someSelected,
  onOpen,
  showRating,
}: LeadResultsTableProps) {
  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Businesses matching your search</caption>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
              <th scope="col" className="w-10 py-2.5 pr-2 pl-4">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={onToggleAll}
                  aria-label="Select all visible businesses"
                />
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">Business</th>
              {showRating && <th scope="col" className="px-3 py-2.5 font-medium">Rating</th>}
              <th scope="col" className="px-3 py-2.5 font-medium">Phone</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Website</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Lead score</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                checked={selected.has(lead.id)}
                onToggle={onToggle}
                onOpen={onOpen}
                showRating={showRating}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <ul className="divide-y divide-border md:hidden">
        {leads.map((lead) => (
          <li key={lead.id} className="flex gap-3 p-4">
            <Checkbox
              className="mt-1"
              checked={selected.has(lead.id)}
              onCheckedChange={() => onToggle(lead.id)}
              aria-label={`Select ${lead.name}`}
            />
            <button
              type="button"
              onClick={() => onOpen(lead)}
              className="flex min-w-0 flex-1 cursor-pointer flex-col gap-2 text-left focus-visible:outline-none"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium leading-snug">{lead.name}</span>
                <LeadScoreBadge lead={lead.lead} className="shrink-0" />
              </div>
              {lead.address && (
                <span className="line-clamp-1 text-xs text-muted-foreground">{lead.address}</span>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {showRating && <StarRating rating={lead.rating} count={lead.reviewCount} />}
                <WebsiteStatus website={lead.website} />
              </div>
              {lead.phone && <span className="font-mono text-xs tabular">{lead.phone}</span>}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

const LeadRow = memo(function LeadRow({
  lead,
  checked,
  onToggle,
  onOpen,
  showRating,
}: {
  lead: Lead;
  checked: boolean;
  onToggle: (id: string) => void;
  onOpen: (lead: Lead) => void;
  showRating: boolean;
}) {
  const closed = lead.status && lead.status !== "OPERATIONAL";

  return (
    <tr
      onClick={() => onOpen(lead)}
      className={cn(
        "group cursor-pointer border-b border-border transition-colors duration-150 last:border-0 hover:bg-muted/50",
        checked && "bg-accent/50 hover:bg-accent/70",
      )}
    >
      <td className="py-3 pr-2 pl-4" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle(lead.id)}
          aria-label={`Select ${lead.name}`}
        />
      </td>
      <td className="max-w-80 px-3 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(lead);
          }}
          className="flex cursor-pointer items-center gap-1 text-left font-medium hover:text-primary focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <span className="truncate">{lead.name}</span>
          <ChevronRight
            className="size-3.5 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-60"
            aria-hidden
          />
        </button>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{lead.address ?? "No address"}</span>
        </div>
        {closed && (
          <span className="mt-1 inline-block rounded bg-destructive/10 px-1.5 py-px text-[11px] font-medium text-destructive">
            {lead.status === "CLOSED_PERMANENTLY" ? "Permanently closed" : "Temporarily closed"}
          </span>
        )}
      </td>
      {showRating && (
        <td className="px-3 py-3 whitespace-nowrap">
          <StarRating rating={lead.rating} count={lead.reviewCount} />
        </td>
      )}
      <td className="px-3 py-3 font-mono text-xs whitespace-nowrap tabular">
        {lead.phone ?? <span className="font-sans text-muted-foreground">—</span>}
      </td>
      <td className="px-3 py-3">
        <WebsiteStatus website={lead.website} />
      </td>
      <td className="px-3 py-3">
        <LeadScoreBadge lead={lead.lead} />
      </td>
      <td className="py-3 pr-3 pl-1">
        <LeadRowActions lead={lead} />
      </td>
    </tr>
  );
});
