import "server-only";
import { PAGE_SIZE } from "../../constants/search.constants";
import type { SearchRequest } from "../../schemas/search.schema";
import type { Business, BusinessStatus, SearchResponse } from "../../types/lead.types";
import { ProviderError } from "./provider-error";

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

// Only request what we show — each field tier is billed differently.
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.primaryTypeDisplayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.googleMapsUri",
  "places.location",
  "nextPageToken",
].join(",");

type GooglePlace = {
  id: string;
  displayName?: { text: string };
  primaryTypeDisplayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: BusinessStatus;
  googleMapsUri?: string;
  location?: { latitude: number; longitude: number };
};

/**
 * Text-search businesses. Results are fetched live and never stored —
 * Google's terms only allow caching place IDs long-term.
 */
export async function searchGoogle(req: SearchRequest, apiKey: string): Promise<SearchResponse> {
  const res = await fetch(TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: `${req.category} in ${req.location}`,
      pageSize: PAGE_SIZE,
      ...(req.pageToken ? { pageToken: req.pageToken } : {}),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new ProviderError(body?.error?.message ?? "Google Places request failed", res.status);
  }

  const data = (await res.json()) as { places?: GooglePlace[]; nextPageToken?: string };

  return {
    kind: "business",
    source: "google",
    demo: false,
    businesses: (data.places ?? []).map(normalizePlace),
    nextPageToken: data.nextPageToken ?? null,
  };
}

function normalizePlace(p: GooglePlace): Business {
  return {
    id: p.id,
    source: "google",
    name: p.displayName?.text ?? "Unnamed business",
    category: p.primaryTypeDisplayName?.text ?? null,
    address: p.formattedAddress ?? null,
    phone: p.nationalPhoneNumber ?? null,
    internationalPhone: p.internationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    rating: p.rating ?? null,
    reviewCount: p.userRatingCount ?? 0,
    status: p.businessStatus ?? null,
    listingUrl: p.googleMapsUri ?? null,
    location: p.location ? { lat: p.location.latitude, lng: p.location.longitude } : null,
  };
}
