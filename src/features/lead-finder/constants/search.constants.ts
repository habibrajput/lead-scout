import type { LeadSort, LeadTier } from "../types/lead.types";

/** Google returns at most 20 per page and 60 per query. */
export const PAGE_SIZE = 20;
export const MAX_RESULTS = 60;

export const SORT_OPTIONS: { value: LeadSort; label: string }[] = [
  { value: "score", label: "Lead score" },
  { value: "reviews", label: "Most reviews" },
  { value: "rating", label: "Highest rating" },
  { value: "name", label: "Name (A–Z)" },
];


export const TIER_META: Record<LeadTier, { label: string; description: string }> = {
  hot: { label: "Hot", description: "Score 75+ — contact first" },
  warm: { label: "Warm", description: "Score 50–74" },
  cold: { label: "Cold", description: "Score below 50" },
};
