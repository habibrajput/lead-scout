import type { SearchRequest } from "../schemas/search.schema";
import type { SearchResponse } from "../types/lead.types";

export async function fetchLeads(req: SearchRequest): Promise<SearchResponse> {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Search failed (${res.status})`);
  }

  return res.json();
}
