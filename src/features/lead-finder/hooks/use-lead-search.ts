"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { SOURCES } from "../constants/sources";
import { validateCriteria } from "../schemas/criteria.schema";
import { criteriaFromParams, paramsFromCriteria } from "../services/criteria-url";
import { fetchLeads } from "../services/lead-api";
import { toIntentLead, toLead } from "../services/lead-scoring";
import type { SearchCriteria } from "../types/criteria.types";
import type { IntentLead, Lead } from "../types/lead.types";

/**
 * The committed search lives in the URL, so it's shareable and survives
 * refresh / back navigation. Only source + category + location hit the API;
 * website / phone / rating / sort are applied client-side.
 */
export function useLeadSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const criteria = useMemo(() => criteriaFromParams(new URLSearchParams(params)), [params]);
  const { source, category, location } = criteria;
  const config = SOURCES[source];
  const active = validateCriteria(criteria) === null;

  const query = useInfiniteQuery({
    queryKey: ["lead-search", source, category.toLowerCase(), location.toLowerCase()],
    queryFn: ({ pageParam }) =>
      fetchLeads({ source, category, location, pageToken: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextPageToken,
    enabled: active,
    // Providers already retry transient upstream errors; don't stack 3 more on top.
    retry: 1,
  });

  const { leads, intents } = useMemo(() => {
    const seen = new Set<string>();
    const leads: Lead[] = [];
    const intents: IntentLead[] = [];
    // Score recency against when the data was fetched — keeps render pure.
    const now = query.dataUpdatedAt;
    for (const page of query.data?.pages ?? []) {
      if (page.kind === "business") {
        for (const b of page.businesses) {
          if (seen.has(b.id)) continue;
          seen.add(b.id);
          leads.push(toLead(b));
        }
      } else {
        for (const p of page.posts) {
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          intents.push(toIntentLead(p, now));
        }
      }
    }
    return { leads, intents };
  }, [query.data, query.dataUpdatedAt]);

  const href = useCallback(
    (c: SearchCriteria) => `${pathname}?${paramsFromCriteria(c).toString()}`,
    [pathname],
  );

  /** Run a new search (adds a history entry). */
  const search = useCallback(
    (c: SearchCriteria) => router.push(href(c), { scroll: false }),
    [href, router],
  );

  /** Tweak filters/sort of the current search in place. */
  const refine = useCallback(
    (patch: Partial<SearchCriteria>) => router.replace(href({ ...criteria, ...patch }), { scroll: false }),
    [criteria, href, router],
  );

  return {
    criteria,
    config,
    active,
    leads,
    intents,
    demo: query.data?.pages[0]?.demo ?? false,
    fetchedAt: query.dataUpdatedAt,
    search,
    refine,
    isLoading: active && query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
