"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { SearchCriteria } from "../types/criteria.types";
import type { Lead, LeadSort } from "../types/lead.types";

/** Applies the criteria's filters + a local quick-text filter to fetched leads. */
export function useLeadFilters(leads: Lead[], criteria: SearchCriteria, hasReviewData: boolean) {
  const [text, setText] = useState("");
  const q = useDeferredValue(text.trim().toLowerCase());

  // Rating filters/sorts don't apply to sources without review data.
  const minRating = hasReviewData ? criteria.minRating : 0;
  const sort: LeadSort = hasReviewData || criteria.sort === "name" ? criteria.sort : "score";
  const { website, hasPhone } = criteria;

  const filtered = useMemo(() => {
    const out = leads.filter((l) => {
      if (website === "none" && l.website) return false;
      if (hasPhone && !l.phone && !l.internationalPhone) return false;
      if (minRating > 0 && (l.rating ?? 0) < minRating) return false;
      if (q && !`${l.name} ${l.address ?? ""} ${l.category ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const by: Record<LeadSort, (a: Lead, b: Lead) => number> = {
      score: (a, b) => b.lead.score - a.lead.score || b.reviewCount - a.reviewCount,
      reviews: (a, b) => b.reviewCount - a.reviewCount,
      rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return out.sort(by[sort]);
  }, [leads, website, hasPhone, minRating, sort, q]);

  const isFiltered = website === "none" || hasPhone || minRating > 0 || q !== "";

  return { text, setText, sort, filtered, isFiltered };
}
