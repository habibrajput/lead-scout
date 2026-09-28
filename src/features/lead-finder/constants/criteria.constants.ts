import type { SearchCriteria } from "../types/criteria.types";
import { DEFAULT_SOURCE } from "./sources";

export const DEFAULT_CRITERIA: SearchCriteria = {
  source: DEFAULT_SOURCE,
  category: "",
  location: "",
  website: "none",
  hasPhone: false,
  minRating: 0,
  sort: "score",
};

/** Minimum-rating steps the UI offers; parsed ratings snap down to one of these. */
export const RATING_STEPS = [3, 3.5, 4, 4.5] as const;

export const EXAMPLE_QUERIES = [
  "Restaurants in Lahore on Google Maps without a website",
  "Dentists in Karachi with a phone number, rated 4+",
  "Salons on Reddit",
  "Bakeries in Berlin on OpenStreetMap",
];
