import type { SourceId } from "../constants/sources";

export type BusinessStatus = "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";

/** A business as returned by our search API, normalised from any listing source. */
export type Business = {
  id: string;
  source: SourceId;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  internationalPhone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number;
  status: BusinessStatus | null;
  /** Link to the listing on its source platform. */
  listingUrl: string | null;
  location: { lat: number; lng: number } | null;
};

export type LeadTier = "hot" | "warm" | "cold";

export type LeadScore = {
  score: number;
  tier: LeadTier;
  reasons: { label: string; points: number }[];
};

export type Lead = Business & { lead: LeadScore };

/** A public post from someone looking for a website / web designer. */
export type IntentPost = {
  id: string;
  source: SourceId;
  title: string;
  excerpt: string;
  community: string;
  author: string;
  url: string;
  createdAt: string;
  upvotes: number;
  comments: number;
};

export type IntentLead = IntentPost & { lead: LeadScore };

type SearchMeta = {
  source: SourceId;
  /** True when the source isn't configured and results are generated. */
  demo: boolean;
  nextPageToken: string | null;
};

export type SearchResponse =
  | (SearchMeta & { kind: "business"; businesses: Business[] })
  | (SearchMeta & { kind: "intent"; posts: IntentPost[] });

export type LeadSort = "score" | "reviews" | "rating" | "name";
export type IntentSort = "score" | "newest" | "engagement";
