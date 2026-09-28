import { AlertTriangle, RotateCcw, SearchX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function IdleState() {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
        <Sparkles className="size-6" aria-hidden />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-lg font-semibold">Just describe who you&apos;re looking for</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Type a sentence like <em className="text-foreground not-italic">“Restaurants in Lahore on
          Google Maps without a website”</em>. We&apos;ll work out the platform, business type,
          location and filters, and show you what we understood before searching.
        </p>
      </div>
      <ol className="grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
        {[
          ["Describe", "Business type, city, platform and any filters — in plain words."],
          ["Qualify", "Leads are scored so the best no-website businesses come first."],
          ["Export", "Download a CSV of the leads you want to contact."],
        ].map(([title, body], i) => (
          <li key={title} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-medium text-primary">Step {i + 1}</p>
            <p className="mt-1 text-sm font-medium">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Loading results" className="divide-y divide-border">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="size-4 rounded" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="hidden h-4 w-20 md:block" />
          <Skeleton className="hidden h-4 w-24 md:block" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h2 className="font-semibold">Search failed</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <RotateCcw aria-hidden />
        Try again
      </Button>
    </div>
  );
}

export function NoResultsState({
  filtered,
  onResetFilters,
}: {
  filtered: boolean;
  onResetFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <SearchX className="size-6" aria-hidden />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h2 className="font-semibold">
          {filtered ? "No businesses match these filters" : "No businesses found"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {filtered
            ? "Every result has a website or falls outside your filters. Try loosening them."
            : "Try a broader business type (e.g. “Salons” instead of “Bridal salons”), a larger area or another platform."}
        </p>
      </div>
      {filtered && (
        <Button variant="outline" onClick={onResetFilters}>
          Reset filters
        </Button>
      )}
    </div>
  );
}
