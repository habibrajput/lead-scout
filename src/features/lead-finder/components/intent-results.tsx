"use client";

import { ArrowBigUp, Download, ExternalLink, Flame, Link2, MessageSquare, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SOURCES } from "../constants/sources";
import { useIntentFilters } from "../hooks/use-intent-filters";
import { downloadCsv, INTENT_COLUMNS } from "../services/export-csv";
import type { IntentLead, IntentSort } from "../types/lead.types";
import { copyText } from "./lead-actions";
import { LeadScoreBadge } from "./lead-score-badge";
import { NoResultsState } from "./result-states";

const SORT_OPTIONS: { value: IntentSort; label: string }[] = [
  { value: "score", label: "Intent score" },
  { value: "newest", label: "Newest" },
  { value: "engagement", label: "Most engagement" },
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string, now: number) {
  const mins = (new Date(iso).getTime() - now) / 60_000;
  if (Math.abs(mins) < 60) return rtf.format(Math.round(mins), "minute");
  const hours = mins / 60;
  if (Math.abs(hours) < 24) return rtf.format(Math.round(hours), "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

export function IntentStats({ posts, now }: { posts: IntentLead[]; now: number }) {
  const weekAgo = now - 7 * 86_400_000;
  const stats = [
    { label: "Posts found", value: posts.length, hint: "asking for a website", icon: MessageSquare, emphasis: true },
    {
      label: "Last 7 days",
      value: posts.filter((p) => new Date(p.createdAt).getTime() >= weekAgo).length,
      hint: "fresh conversations",
      icon: ArrowBigUp,
    },
    { label: "Hot leads", value: posts.filter((p) => p.lead.tier === "hot").length, hint: "intent score 75+", icon: Flame },
    { label: "Communities", value: new Set(posts.map((p) => p.community)).size, hint: "distinct subreddits", icon: Users },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            data-emphasis={s.emphasis ?? false}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 data-[emphasis=true]:border-primary/30 data-[emphasis=true]:bg-accent/60"
          >
            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Icon className="size-3.5" aria-hidden />
              {s.label}
            </dt>
            <dd className="font-mono text-2xl font-semibold tabular">{s.value}</dd>
            <dd className="text-xs text-muted-foreground">{s.hint}</dd>
          </div>
        );
      })}
    </dl>
  );
}

type IntentResultsProps = { posts: IntentLead[]; exportName: string; now: number };

export function IntentResults({ posts, exportName, now }: IntentResultsProps) {
  const { text, setText, sort, setSort, filtered } = useIntentFilters(posts);

  const handleExport = () => {
    downloadCsv(filtered, INTENT_COLUMNS, `${exportName}.csv`);
    toast.success(`Exported ${filtered.length} ${filtered.length === 1 ? "post" : "posts"}`);
  };

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Filter posts"
              aria-label="Filter posts by text or community"
              className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-8 text-sm transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select items={SORT_OPTIONS} value={sort} onValueChange={(v) => v && setSort(v as IntentSort)}>
              <SelectTrigger className="h-9 min-w-44" aria-label="Sort by">
                <span className="text-muted-foreground">Sort:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-9" onClick={handleExport} disabled={filtered.length === 0}>
              <Download aria-hidden />
              Export CSV
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Showing <strong className="font-mono font-semibold text-foreground tabular">{filtered.length}</strong>{" "}
          of <span className="font-mono tabular">{posts.length}</span> posts
        </p>
      </div>

      {filtered.length === 0 ? (
        <NoResultsState filtered={posts.length > 0} onResetFilters={() => setText("")} />
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((p) => (
            <IntentRow key={p.id} post={p} now={now} />
          ))}
        </ul>
      )}
    </>
  );
}

function IntentRow({ post, now }: { post: IntentLead; now: number }) {
  const source = SOURCES[post.source];

  return (
    <li className="flex flex-col gap-2.5 p-4 transition-colors duration-150 hover:bg-muted/40 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <LeadScoreBadge lead={post.lead} />
        <span className="font-medium text-foreground/80">{post.community}</span>
        <span aria-hidden>·</span>
        <time dateTime={post.createdAt}>{timeAgo(post.createdAt, now)}</time>
        <span aria-hidden>·</span>
        <span>u/{post.author}</span>
      </div>

      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[15px] leading-snug font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        {post.title}
      </a>

      {post.excerpt && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {post.lead.reasons.slice(0, 3).map((r) => (
          <span
            key={r.label}
            className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {r.label}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Upvotes">
            <ArrowBigUp className="size-4" aria-hidden />
            <span className="font-mono tabular">{post.upvotes}</span>
            <span className="sr-only">upvotes</span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Comments">
            <MessageSquare className="size-3.5" aria-hidden />
            <span className="font-mono tabular">{post.comments}</span>
            <span className="sr-only">comments</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label="Copy post link"
            onClick={() => copyText(post.url, "Link")}
          >
            <Link2 aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            nativeButton={false}
            render={<a href={post.url} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink aria-hidden />
            {source.listingLabel}
          </Button>
        </div>
      </div>
    </li>
  );
}
