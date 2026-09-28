import { SOURCES } from "../constants/sources";
import type { SearchCriteria } from "../types/criteria.types";

/** Returns what's missing for a runnable search, or null when it's good to go. */
export function validateCriteria(c: SearchCriteria): string | null {
  if (c.category.trim().length < 2) {
    return "Say what kind of business — e.g. “Restaurants in Lahore”.";
  }
  if (SOURCES[c.source].locationRequired && c.location.trim().length < 2) {
    return `Add a location — e.g. “${c.category} in Lahore”.`;
  }
  return null;
}
