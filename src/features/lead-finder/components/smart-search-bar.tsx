"use client";

import { ArrowRight, Loader2, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_CRITERIA, EXAMPLE_QUERIES } from "../constants/criteria.constants";
import type { SourceAvailability, SourceId } from "../constants/sources";
import { validateCriteria } from "../schemas/criteria.schema";
import { composeQuery, parseQuery } from "../services/query-parser";
import type { SearchCriteria } from "../types/criteria.types";
import { FiltersPopover } from "./filters-popover";
import { PlatformSelect } from "./platform-select";
import { QueryChips } from "./query-chips";

type SmartSearchBarProps = {
  /** The committed search (from the URL). */
  criteria: SearchCriteria;
  /** Whether a committed search is on screen — edits then apply immediately. */
  hasActiveSearch: boolean;
  onSearch: (criteria: SearchCriteria) => void;
  isSearching: boolean;
  availability: SourceAvailability;
};

/**
 * One-line, natural-language search: type “Restaurants in Lahore on Google Maps
 * without a website” and see how it was understood as chips underneath.
 */
export function SmartSearchBar({
  criteria,
  hasActiveSearch,
  onSearch,
  isSearching,
  availability,
}: SmartSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(() => (hasActiveSearch ? composeQuery(criteria) : ""));
  const [baseSource, setBaseSource] = useState<SourceId>(criteria.source);
  const [error, setError] = useState<string | null>(null);

  // Mirror the committed search back into the bar (submit, back/forward, chip edits).
  const committedText = hasActiveSearch ? composeQuery(criteria) : "";
  const [lastCommitted, setLastCommitted] = useState(committedText);
  if (committedText !== lastCommitted) {
    setLastCommitted(committedText);
    if (committedText) setText(committedText);
    setBaseSource(criteria.source);
  }

  /** What the current text means right now — drives chips and the platform dropdown. */
  const draft = useMemo<SearchCriteria>(
    () => ({ ...DEFAULT_CRITERIA, source: baseSource, sort: criteria.sort, ...parseQuery(text) }),
    [text, baseSource, criteria.sort],
  );

  // ⌘K / Ctrl+K focuses the search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (next: SearchCriteria) => {
    const problem = validateCriteria(next);
    setError(problem);
    if (problem) {
      inputRef.current?.focus();
      return;
    }
    onSearch(next);
  };

  /** Structured edit (chip ✕, filters, platform) → rewrite the sentence, apply if live. */
  const update = (patch: Partial<SearchCriteria>) => {
    const next = { ...draft, ...patch };
    if (patch.source) setBaseSource(patch.source);
    if (text.trim()) setText(composeQuery(next));
    if (hasActiveSearch && validateCriteria(next) === null) onSearch(next);
  };

  const runExample = (q: string) => {
    setText(q);
    submit({ ...DEFAULT_CRITERIA, source: baseSource, ...parseQuery(q) });
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="flex flex-col gap-3">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
        className={cn(
          "flex h-12 items-stretch rounded-xl border bg-background shadow-xs transition-[border-color,box-shadow] duration-150",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25",
          error ? "border-destructive/60" : "border-input",
        )}
      >
        <PlatformSelect
          value={draft.source}
          onChange={(source) => update({ source })}
          availability={availability}
        />

        <div className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Restaurants in Lahore without a website…"
            aria-label="Describe what you're looking for"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "search-error" : undefined}
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            className="h-full w-full min-w-0 bg-transparent pr-2 pl-9 text-[15px] outline-none placeholder:text-muted-foreground/80"
          />
          {!hasText && (
            <kbd className="pointer-events-none mr-2 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
              ⌘K
            </kbd>
          )}
        </div>

        <div className="flex items-center gap-1 pr-1.5">
          <FiltersPopover criteria={draft} onChange={update} />
          <Button
            type="submit"
            disabled={isSearching}
            className="h-9 gap-1.5 px-3 sm:px-4"
            aria-label="Search"
          >
            {isSearching ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <ArrowRight className="sm:hidden" aria-hidden />
            )}
            <span className="hidden sm:inline">{isSearching ? "Searching…" : "Search"}</span>
          </Button>
        </div>
      </form>

      {error ? (
        <p id="search-error" role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hasText ? (
        <QueryChips criteria={draft} onRemove={update} />
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" aria-hidden />
            Try
          </span>
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => runExample(q)}
              className="h-7 cursor-pointer rounded-md border border-border bg-card px-2.5 text-xs text-foreground/80 transition-colors duration-150 hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
