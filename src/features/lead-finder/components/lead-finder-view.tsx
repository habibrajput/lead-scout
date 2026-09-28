"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MAX_RESULTS } from "../constants/search.constants";
import type { SourceAvailability } from "../constants/sources";
import { useLeadFilters } from "../hooks/use-lead-filters";
import { useLeadSearch } from "../hooks/use-lead-search";
import { useSelection } from "../hooks/use-selection";
import { downloadCsv, LEAD_COLUMNS } from "../services/export-csv";
import type { Lead } from "../types/lead.types";
import { DemoBanner } from "./demo-banner";
import { IntentResults, IntentStats } from "./intent-results";
import { LeadDetailSheet } from "./lead-detail-sheet";
import { LeadResultsTable } from "./lead-results-table";
import { LeadStats } from "./lead-stats";
import { ErrorState, IdleState, LoadingState, NoResultsState } from "./result-states";
import { ResultsToolbar } from "./results-toolbar";
import { SmartSearchBar } from "./smart-search-bar";

export function LeadFinderView({ availability }: { availability: SourceAvailability }) {
  const search = useLeadSearch();
  const { config, criteria } = search;
  const { text, setText, sort, filtered, isFiltered } = useLeadFilters(
    search.leads,
    criteria,
    config.hasReviewData,
  );
  const visibleIds = useMemo(() => filtered.map((l) => l.id), [filtered]);
  const selection = useSelection(visibleIds);
  const [openLead, setOpenLead] = useState<Lead | null>(null);

  const exportName = `${config.id}-${criteria.category}-${criteria.location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");

  const handleExport = () => {
    const rows = selection.selected.size
      ? search.leads.filter((l) => selection.selected.has(l.id))
      : filtered;
    downloadCsv(rows, LEAD_COLUMNS, `leads-${exportName}.csv`);
    toast.success(`Exported ${rows.length} ${rows.length === 1 ? "lead" : "leads"}`);
  };

  const resetFilters = () => {
    setText("");
    search.refine({ website: "any", hasPhone: false, minRating: 0 });
  };

  const isIntent = config.kind === "intent";
  const hasResults = isIntent ? search.intents.length > 0 : search.leads.length > 0;
  const ready = search.active && !search.isLoading && !search.isError;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:py-6">
      <section aria-label="Search" className="rounded-xl border border-border bg-card p-3 shadow-xs sm:p-4">
        <SmartSearchBar
          criteria={criteria}
          hasActiveSearch={search.active}
          availability={availability}
          isSearching={search.isLoading}
          onSearch={(c) => {
            selection.clear();
            search.search(c);
          }}
        />
      </section>

      {search.demo && hasResults && <DemoBanner source={config} />}

      {ready && hasResults &&
        (isIntent ? (
          <IntentStats posts={search.intents} now={search.fetchedAt} />
        ) : (
          <LeadStats leads={search.leads} />
        ))}

      <section
        aria-label="Results"
        className="overflow-hidden rounded-xl border border-border bg-card shadow-xs"
      >
        {!search.active ? (
          <IdleState />
        ) : search.isLoading ? (
          <LoadingState />
        ) : search.isError ? (
          <ErrorState
            message={search.error?.message ?? "Something went wrong."}
            onRetry={() => search.refetch()}
          />
        ) : isIntent ? (
          <IntentResults
            posts={search.intents}
            exportName={`posts-${exportName}`}
            now={search.fetchedAt}
          />
        ) : (
          <>
            <ResultsToolbar
              text={text}
              onTextChange={setText}
              sort={sort}
              onSortChange={(s) => search.refine({ sort: s })}
              showRatingSorts={config.hasReviewData}
              shown={filtered.length}
              total={search.leads.length}
              selectedCount={selection.selected.size}
              onExport={handleExport}
              onClearSelection={selection.clear}
            />
            {filtered.length === 0 ? (
              <NoResultsState filtered={hasResults && isFiltered} onResetFilters={resetFilters} />
            ) : (
              <LeadResultsTable
                leads={filtered}
                selected={selection.selected}
                onToggle={selection.toggle}
                onToggleAll={selection.toggleAllVisible}
                allSelected={selection.allVisibleSelected}
                someSelected={selection.someVisibleSelected}
                onOpen={setOpenLead}
                showRating={config.hasReviewData}
              />
            )}
            {config.id === "osm" && hasResults && (
              <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                Data ©{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  OpenStreetMap contributors
                </a>
                , available under the ODbL.
              </p>
            )}
          </>
        )}

        {ready && search.hasNextPage && (
          <div className="flex flex-col items-center gap-1 border-t border-border p-4">
            <Button
              variant="outline"
              onClick={() => search.fetchNextPage()}
              disabled={search.isFetchingNextPage}
            >
              {search.isFetchingNextPage && <Loader2 className="animate-spin" aria-hidden />}
              {search.isFetchingNextPage ? "Loading…" : isIntent ? "Load more posts" : "Load more businesses"}
            </Button>
            {config.id === "google" && (
              <p className="text-xs text-muted-foreground">
                Google returns up to {MAX_RESULTS} results per search. Narrow the area to find more.
              </p>
            )}
          </div>
        )}
      </section>

      <LeadDetailSheet lead={openLead} onOpenChange={(open) => !open && setOpenLead(null)} />
    </main>
  );
}
