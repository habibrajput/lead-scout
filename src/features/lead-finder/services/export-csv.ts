import { SOURCES } from "../constants/sources";
import type { IntentLead, Lead } from "../types/lead.types";

type Column<T> = { header: string; value: (row: T) => string | number | null };

export const LEAD_COLUMNS: Column<Lead>[] = [
  { header: "Name", value: (l) => l.name },
  { header: "Category", value: (l) => l.category },
  { header: "Phone", value: (l) => l.internationalPhone ?? l.phone },
  { header: "Address", value: (l) => l.address },
  { header: "Website", value: (l) => l.website },
  { header: "Rating", value: (l) => l.rating },
  { header: "Reviews", value: (l) => l.reviewCount },
  { header: "Lead score", value: (l) => l.lead.score },
  { header: "Tier", value: (l) => l.lead.tier },
  { header: "Source", value: (l) => SOURCES[l.source].label },
  { header: "Listing", value: (l) => l.listingUrl },
];

export const INTENT_COLUMNS: Column<IntentLead>[] = [
  { header: "Title", value: (p) => p.title },
  { header: "Community", value: (p) => p.community },
  { header: "Author", value: (p) => p.author },
  { header: "Posted", value: (p) => p.createdAt },
  { header: "Upvotes", value: (p) => p.upvotes },
  { header: "Comments", value: (p) => p.comments },
  { header: "Intent score", value: (p) => p.lead.score },
  { header: "Tier", value: (p) => p.lead.tier },
  { header: "URL", value: (p) => p.url },
];

function escape(v: string | number | null) {
  if (v == null) return "";
  const s = String(v);
  // Also neutralise spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv<T>(rows: T[], columns: Column<T>[]) {
  return [columns.map((c) => c.header), ...rows.map((r) => columns.map((c) => escape(c.value(r))))]
    .map((r) => r.join(","))
    .join("\n");
}

export function downloadCsv<T>(rows: T[], columns: Column<T>[], filename: string) {
  const blob = new Blob([`﻿${toCsv(rows, columns)}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
