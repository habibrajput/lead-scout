"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { IntentLead, IntentSort } from "../types/lead.types";

export function useIntentFilters(posts: IntentLead[]) {
  const [text, setText] = useState("");
  const [sort, setSort] = useState<IntentSort>("score");
  const q = useDeferredValue(text.trim().toLowerCase());

  const filtered = useMemo(() => {
    const out = q
      ? posts.filter((p) => `${p.title} ${p.excerpt} ${p.community}`.toLowerCase().includes(q))
      : [...posts];
    const by: Record<IntentSort, (a: IntentLead, b: IntentLead) => number> = {
      score: (a, b) => b.lead.score - a.lead.score || b.createdAt.localeCompare(a.createdAt),
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      engagement: (a, b) => b.upvotes + b.comments - (a.upvotes + a.comments),
    };
    return out.sort(by[sort]);
  }, [posts, q, sort]);

  return { text, setText, sort, setSort, filtered };
}
