import "server-only";
import type { SearchRequest } from "../../schemas/search.schema";
import type { IntentPost, SearchResponse } from "../../types/lead.types";
import { ProviderError } from "./provider-error";

const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const SEARCH_URL = "https://oauth.reddit.com/search";
const USER_AGENT = process.env.REDDIT_USER_AGENT ?? "web:leadscout:v0.1";

/** Phrases people use when they want someone to build them a website. */
export const INTENT_PHRASES = [
  "need a website",
  "looking for a web designer",
  "looking for a web developer",
  "website for my business",
  "build me a website",
  "recommend a web designer",
];

let token: { value: string; expiresAt: number } | null = null;

async function getToken(clientId: string, secret: string) {
  if (token && Date.now() < token.expiresAt - 60_000) return token.value;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });
  if (!res.ok) throw new ProviderError("Reddit authentication failed — check your credentials", res.status);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token.value;
}

type RedditChild = {
  data: {
    id: string;
    title: string;
    selftext: string;
    subreddit_name_prefixed: string;
    author: string;
    permalink: string;
    created_utc: number;
    score: number;
    num_comments: number;
    over_18: boolean;
  };
};

export function buildRedditQuery(req: SearchRequest) {
  const phrases = INTENT_PHRASES.map((p) => `"${p}"`).join(" OR ");
  return [`(${phrases})`, req.category, req.location].filter(Boolean).join(" ");
}

export async function searchReddit(
  req: SearchRequest,
  creds: { clientId: string; secret: string },
): Promise<SearchResponse> {
  const accessToken = await getToken(creds.clientId, creds.secret);
  const params = new URLSearchParams({
    q: buildRedditQuery(req),
    sort: "new",
    t: "month",
    type: "link",
    limit: "25",
    ...(req.pageToken ? { after: req.pageToken } : {}),
  });

  const res = await fetch(`${SEARCH_URL}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": USER_AGENT },
    cache: "no-store",
  });
  if (!res.ok) throw new ProviderError("Reddit search failed", res.status);

  const data = (await res.json()) as { data: { children: RedditChild[]; after: string | null } };

  return {
    kind: "intent",
    source: "reddit",
    demo: false,
    posts: data.data.children.filter((c) => !c.data.over_18).map(({ data: d }) => normalize(d)),
    nextPageToken: data.data.after,
  };
}

function normalize(d: RedditChild["data"]): IntentPost {
  return {
    id: `reddit_${d.id}`,
    source: "reddit",
    title: d.title,
    excerpt: d.selftext.replace(/\s+/g, " ").trim().slice(0, 280),
    community: d.subreddit_name_prefixed,
    author: d.author,
    url: `https://www.reddit.com${d.permalink}`,
    createdAt: new Date(d.created_utc * 1000).toISOString(),
    upvotes: d.score,
    comments: d.num_comments,
  };
}
