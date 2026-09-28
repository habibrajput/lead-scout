import "server-only";
import { MAX_RESULTS, PAGE_SIZE } from "../../constants/search.constants";
import type { SearchRequest } from "../../schemas/search.schema";
import type { Business, SearchResponse } from "../../types/lead.types";
import { hash, pick, rng, titleCase } from "./demo-utils";

/**
 * Deterministic fake results so the UI works without a Google API key.
 * Same query → same businesses, so paging and filters behave realistically.
 */
export async function searchDemoBusinesses(req: SearchRequest): Promise<SearchResponse> {
  await new Promise((r) => setTimeout(r, 450));

  const page = req.pageToken ? Number(req.pageToken) || 0 : 0;
  const seed = hash(`${req.category.toLowerCase()}|${req.location.toLowerCase()}`);
  const start = page * PAGE_SIZE;
  const count = Math.min(PAGE_SIZE, MAX_RESULTS - start);

  const businesses = Array.from({ length: count }, (_, i) =>
    makeBusiness(req, rng(seed + start + i), start + i),
  );

  return {
    kind: "business",
    source: "google",
    demo: true,
    businesses,
    nextPageToken: start + count < MAX_RESULTS ? String(page + 1) : null,
  };
}

const PREFIXES = ["Al-Noor", "Royal", "City", "Golden", "New", "Star", "Green", "Prime", "Classic", "Sunrise", "Urban", "Family", "Metro", "Crown", "Blue"];
const SUFFIXES = ["House", "Point", "Corner", "Studio", "Center", "Hub", "Express", "& Co.", "Lounge", "Palace"];
const STREETS = ["Main Boulevard", "Mall Road", "Canal View", "Market Street", "Park Avenue", "Model Town", "Gulberg", "Johar Town", "DHA Phase 5", "Liberty Market"];

function makeBusiness(req: SearchRequest, rand: () => number, index: number): Business {
  const singular = req.category.replace(/s$/i, "");
  const name = `${pick(PREFIXES, rand)} ${titleCase(singular)} ${pick(SUFFIXES, rand)}`.replace(/\s+/g, " ");
  const hasWebsite = rand() < 0.38;
  const hasPhone = rand() < 0.82;
  const reviewCount = rand() < 0.1 ? 0 : Math.round(Math.pow(rand(), 2.2) * 900);
  const rating = reviewCount === 0 ? null : Math.round((3 + rand() * 2) * 10) / 10;
  const closed = rand() < 0.05;
  const digits = String(Math.floor(3000000000 + rand() * 999999999));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");

  return {
    id: `demo_${slug}_${index}`,
    source: "google",
    name,
    category: titleCase(singular),
    address: `${1 + Math.floor(rand() * 240)} ${pick(STREETS, rand)}, ${titleCase(req.location)}`,
    phone: hasPhone ? `0${digits.slice(0, 3)} ${digits.slice(3)}` : null,
    internationalPhone: hasPhone ? `+92 ${digits.slice(0, 3)} ${digits.slice(3)}` : null,
    website: hasWebsite ? `https://www.${slug}.com` : null,
    rating,
    reviewCount,
    status: closed ? "CLOSED_TEMPORARILY" : "OPERATIONAL",
    listingUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${req.location}`)}`,
    location: null,
  };
}
