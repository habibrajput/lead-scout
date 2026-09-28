import "server-only";
import type { SearchRequest } from "../../schemas/search.schema";
import type { Business, SearchResponse } from "../../types/lead.types";
import { delay, titleCase } from "./demo-utils";
import { osmFiltersFor } from "./osm-tags";
import { ProviderError } from "./provider-error";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const MAX_RESULTS = 300;
/** Overpass gets slow / times out on huge areas, so clamp to ~1° around the centre. */
const MAX_SPAN_DEG = 1;
const CACHE_TTL_MS = 10 * 60 * 1000;

// Nominatim and Overpass are community-run: identify ourselves and cache.
const USER_AGENT = process.env.OSM_USER_AGENT ?? "LeadScout/0.1 (lead finder)";
const cache = new Map<string, { at: number; value: SearchResponse }>();

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export async function searchOsm(req: SearchRequest): Promise<SearchResponse> {
  const key = `${req.category.toLowerCase()}|${req.location.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

  const bbox = await geocode(req.location);
  const { label, filters } = osmFiltersFor(req.category);
  const area = `(${bbox.join(",")})`;

  const query = `[out:json][timeout:25];(${filters
    .map((f) => `nwr${f}["name"]${area};`)
    .join("")});out center tags ${MAX_RESULTS};`;

  const res = await runOverpass(query);

  if (!res.ok) {
    throw new ProviderError(
      res.status === 429 || res.status === 504
        ? "OpenStreetMap is busy right now. Try again in a minute."
        : "OpenStreetMap search failed",
      res.status,
    );
  }

  const data = (await res.json()) as { elements?: OsmElement[] };
  const value: SearchResponse = {
    kind: "business",
    source: "osm",
    demo: false,
    businesses: (data.elements ?? []).map((el) => normalize(el, label)),
    nextPageToken: null,
  };
  cache.set(key, { at: Date.now(), value });
  return value;
}

/** The public Overpass server sheds load with 429/504 — retry once before giving up. */
async function runOverpass(query: string, attempt = 1): Promise<Response> {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": USER_AGENT },
    body: new URLSearchParams({ data: query }),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  }).catch(() => new Response(null, { status: 504 }));

  if ((res.status === 429 || res.status === 504) && attempt < 2) {
    await delay(1500);
    return runOverpass(query, attempt + 1);
  }
  return res;
}

/** Location → [south, west, north, east] bounding box. */
async function geocode(location: string): Promise<[number, number, number, number]> {
  const url = `${NOMINATIM_URL}?${new URLSearchParams({ q: location, format: "json", limit: "1" })}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) throw new ProviderError("Couldn't look up that location", res.status);

  const [place] = (await res.json()) as { boundingbox: [string, string, string, string]; lat: string; lon: string }[];
  if (!place) throw new ProviderError(`Couldn't find “${location}”. Try a city name.`, 404);

  let [south, north, west, east] = place.boundingbox.map(Number);
  const lat = Number(place.lat);
  const lon = Number(place.lon);
  if (north - south > MAX_SPAN_DEG) [south, north] = [lat - MAX_SPAN_DEG / 2, lat + MAX_SPAN_DEG / 2];
  if (east - west > MAX_SPAN_DEG) [west, east] = [lon - MAX_SPAN_DEG / 2, lon + MAX_SPAN_DEG / 2];
  return [south, west, north, east];
}

function normalize(el: OsmElement, label: string | null): Business {
  const t = el.tags ?? {};
  const street = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
  const address = [street, t["addr:suburb"], t["addr:city"]].filter(Boolean).join(", ");
  const phone = t.phone ?? t["contact:phone"] ?? t["contact:mobile"] ?? null;
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  const typeValue = t.shop ?? t.amenity ?? t.craft ?? t.office ?? t.leisure ?? t.healthcare;

  return {
    id: `osm_${el.type}_${el.id}`,
    source: "osm",
    name: t.name ?? "Unnamed business",
    category: label ?? (typeValue ? titleCase(typeValue.replace(/_/g, " ")) : null),
    address: address || null,
    phone,
    internationalPhone: phone,
    website: t.website ?? t["contact:website"] ?? t.url ?? null,
    rating: null,
    reviewCount: 0,
    status: null,
    listingUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    location: lat != null && lon != null ? { lat, lng: lon } : null,
  };
}
