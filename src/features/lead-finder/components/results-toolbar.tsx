"use client";

import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_OPTIONS } from "../constants/search.constants";
import type { LeadSort } from "../types/lead.types";

type ResultsToolbarProps = {
  text: string;
  onTextChange: (text: string) => void;
  sort: LeadSort;
  onSortChange: (sort: LeadSort) => void;
  showRatingSorts: boolean;
  shown: number;
  total: number;
  selectedCount: number;
  onExport: () => void;
  onClearSelection: () => void;
};

export function ResultsToolbar({
  text,
  onTextChange,
  sort,
  onSortChange,
  showRatingSorts,
  shown,
  total,
  selectedCount,
  onExport,
  onClearSelection,
}: ResultsToolbarProps) {
  const sortOptions = showRatingSorts
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((o) => o.value === "score" || o.value === "name");

  return (
    <div className="flex flex-col gap-2 border-b border-border px-3 py-2.5 sm:flex-row sm:items-center sm:px-4">
      <p className="text-xs text-muted-foreground sm:mr-auto" aria-live="polite">
        <strong className="font-mono font-semibold text-foreground tabular">{shown}</strong> of{" "}
        <span className="font-mono tabular">{total}</span> businesses
        {selectedCount > 0 && (
          <>
            {" · "}
            <strong className="font-semibold text-foreground">{selectedCount}</strong> selected{" "}
            <button
              type="button"
              onClick={onClearSelection}
              className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
            >
              Clear
            </button>
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:w-52 sm:flex-none">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Filter results"
            aria-label="Filter results by name or address"
            className="h-8 w-full rounded-lg border border-input bg-background pr-2.5 pl-8 text-sm transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
          />
        </div>
        <Select items={sortOptions} value={sort} onValueChange={(v) => v && onSortChange(v as LeadSort)}>
          <SelectTrigger className="h-8 min-w-36" aria-label="Sort by">
            <span className="text-muted-foreground">Sort:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onExport} disabled={shown === 0} className="h-8">
          <Download aria-hidden />
          <span className="hidden sm:inline">{selectedCount > 0 ? `Export ${selectedCount}` : "Export"}</span>
        </Button>
      </div>
    </div>
  );
}
