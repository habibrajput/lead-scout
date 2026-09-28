import { DEFAULT_CRITERIA, RATING_STEPS } from "../constants/criteria.constants";
import { DEFAULT_SOURCE, isSourceId } from "../constants/sources";
import type { SearchCriteria } from "../types/criteria.types";
import type { LeadSort } from "../types/lead.types";

const SORTS: LeadSort[] = ["score", "reviews", "rating", "name"];

/** URL ⇄ criteria. Only non-default filters are written, so links stay short. */
export function criteriaFromParams(p: URLSearchParams): SearchCriteria {
  const src = p.get("src");
  const rating = Number(p.get("rating"));
  const sort = p.get("sort") as LeadSort | null;

  return {
    source: isSourceId(src) ? src : DEFAULT_SOURCE,
    category: p.get("q")?.trim() ?? "",
    location: p.get("loc")?.trim() ?? "",
    website: p.get("web") === "any" ? "any" : "none",
    hasPhone: p.get("phone") === "1",
    minRating: (RATING_STEPS as readonly number[]).includes(rating) ? rating : 0,
    sort: sort && SORTS.includes(sort) ? sort : "score",
  };
}

export function paramsFromCriteria(c: SearchCriteria): URLSearchParams {
  const p = new URLSearchParams({ src: c.source, q: c.category });
  if (c.location) p.set("loc", c.location);
  if (c.website !== DEFAULT_CRITERIA.website) p.set("web", c.website);
  if (c.hasPhone) p.set("phone", "1");
  if (c.minRating > 0) p.set("rating", String(c.minRating));
  if (c.sort !== DEFAULT_CRITERIA.sort) p.set("sort", c.sort);
  return p;
}
