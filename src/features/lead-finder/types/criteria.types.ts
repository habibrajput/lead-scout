import type { SourceId } from "../constants/sources";
import type { LeadSort } from "./lead.types";

export type WebsiteFilter = "none" | "any";

/** Everything a search is made of. Lives in the URL; the search bar text is derived from it. */
export type SearchCriteria = {
  source: SourceId;
  category: string;
  location: string;
  website: WebsiteFilter;
  hasPhone: boolean;
  minRating: number;
  sort: LeadSort;
};

/** What the natural-language parser could pick out of a sentence. */
export type ParsedQuery = Partial<SearchCriteria>;
