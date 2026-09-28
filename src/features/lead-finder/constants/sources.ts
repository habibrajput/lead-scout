import { siFoursquare, siGooglemaps, siOpenstreetmap, siReddit, type SimpleIcon } from "simple-icons";

export const SOURCE_IDS = ["google", "osm", "reddit"] as const;
export type SourceId = (typeof SOURCE_IDS)[number];

/**
 * "business" sources return listings we can qualify (no website → lead).
 * "intent" sources return posts from people actively asking for a website.
 */
export type SourceKind = "business" | "intent";

export type SourceConfig = {
  id: SourceId;
  label: string;
  tagline: string;
  kind: SourceKind;
  icon: SimpleIcon;
  /** Env vars that switch the source from demo data to live data. Empty = always live. */
  envVars: string[];
  hasReviewData: boolean;
  keywordLabel: string;
  keywordPlaceholder: string;
  locationRequired: boolean;
  listingLabel: string;
};

export const SOURCES: Record<SourceId, SourceConfig> = {
  google: {
    id: "google",
    label: "Google Maps",
    tagline: "Richest listings, ratings & reviews",
    kind: "business",
    icon: siGooglemaps,
    envVars: ["GOOGLE_MAPS_API_KEY"],
    hasReviewData: true,
    keywordLabel: "Business type",
    keywordPlaceholder: "e.g. Dentists, Salons, Plumbers",
    locationRequired: true,
    listingLabel: "Open in Google Maps",
  },
  osm: {
    id: "osm",
    label: "OpenStreetMap",
    tagline: "Free & open data, no API key",
    kind: "business",
    icon: siOpenstreetmap,
    envVars: [],
    hasReviewData: false,
    keywordLabel: "Business type",
    keywordPlaceholder: "e.g. Dentists, Salons, Plumbers",
    locationRequired: true,
    listingLabel: "Open in OpenStreetMap",
  },
  reddit: {
    id: "reddit",
    label: "Reddit",
    tagline: "People asking for a website",
    kind: "intent",
    icon: siReddit,
    envVars: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
    hasReviewData: false,
    keywordLabel: "Business type or keyword",
    keywordPlaceholder: "e.g. Salon, Bakery, Small business",
    locationRequired: false,
    listingLabel: "Open on Reddit",
  },
};

export const SOURCE_LIST = SOURCE_IDS.map((id) => SOURCES[id]);

/** Shown in the picker, not selectable yet. */
export const UPCOMING_SOURCES: { label: string; tagline: string; icon: SimpleIcon }[] = [
  { label: "Foursquare", tagline: "Listings with website data", icon: siFoursquare },
];

export const DEFAULT_SOURCE: SourceId = "google";

export function isSourceId(v: unknown): v is SourceId {
  return typeof v === "string" && (SOURCE_IDS as readonly string[]).includes(v);
}

/** Which sources have their credentials configured, computed on the server. */
export type SourceAvailability = Record<SourceId, { live: boolean }>;
