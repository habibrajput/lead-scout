import "server-only";
import { type SourceAvailability, SOURCE_IDS, SOURCES } from "../constants/sources";
import type { SearchRequest } from "../schemas/search.schema";
import type { SearchResponse } from "../types/lead.types";
import { searchDemoBusinesses } from "./providers/demo-places";
import { searchDemoReddit } from "./providers/demo-reddit";
import { searchGoogle } from "./providers/google.provider";
import { searchOsm } from "./providers/osm.provider";
import { searchReddit } from "./providers/reddit.provider";

export { ProviderError } from "./providers/provider-error";

/**
 * Single entry point for every lead source. Results are fetched live and not
 * persisted (Google's terms only allow caching place IDs long-term).
 * Sources without credentials fall back to generated demo data.
 */
export async function searchLeads(req: SearchRequest): Promise<SearchResponse> {
  switch (req.source) {
    case "google": {
      const key = process.env.GOOGLE_MAPS_API_KEY;
      return key ? searchGoogle(req, key) : searchDemoBusinesses(req);
    }
    case "osm":
      return searchOsm(req);
    case "reddit": {
      const clientId = process.env.REDDIT_CLIENT_ID;
      const secret = process.env.REDDIT_CLIENT_SECRET;
      return clientId && secret ? searchReddit(req, { clientId, secret }) : searchDemoReddit(req);
    }
  }
}

export function getSourceAvailability(): SourceAvailability {
  return Object.fromEntries(
    SOURCE_IDS.map((id) => [id, { live: SOURCES[id].envVars.every((v) => Boolean(process.env[v])) }]),
  ) as SourceAvailability;
}
