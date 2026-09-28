import "server-only";
import type { SearchRequest } from "../../schemas/search.schema";
import type { IntentPost, SearchResponse } from "../../types/lead.types";
import { delay, hash, pick, rng } from "./demo-utils";

const PAGE = 15;
const MAX = 45;

const TITLES = [
  "Need a website for my {biz}{loc} — where do I start?",
  "Looking for a web designer for a small {biz}{loc}",
  "Recommend a web developer for my {biz}? Budget around $500",
  "Is it worth building a website for my {biz}?",
  "My {biz} only has an Instagram page. Should I get a website?",
  "Who built your small business website? Opening a {biz}{loc}",
  "Need someone to build a simple site with booking for my {biz}",
  "Quote for a {biz} website — is $1,200 fair?",
];
const EXCERPTS = [
  "We've been running for 3 years and customers keep asking if we have a website. Mostly get bookings over WhatsApp. Want something simple with hours, menu/services and a contact form.",
  "I'm not technical at all. Tried Wix but got lost. Would rather pay someone local who can set it up and maintain it monthly.",
  "Got a couple of quotes but they vary wildly. Just need 4–5 pages and to show up on Google when people search nearby.",
  "Our Google Maps listing gets lots of views but no website link. Looking for recommendations, happy to pay for quality.",
];
const COMMUNITIES = ["r/smallbusiness", "r/Entrepreneur", "r/webdev", "r/forhire", "r/marketing", "r/startups"];

export async function searchDemoReddit(req: SearchRequest): Promise<SearchResponse> {
  await delay(400);
  const page = req.pageToken ? Number(req.pageToken) || 0 : 0;
  const seed = hash(`reddit|${req.category.toLowerCase()}|${req.location.toLowerCase()}`);
  const biz = req.category.replace(/s$/i, "").toLowerCase();
  const loc = req.location ? ` in ${req.location}` : "";
  const now = Date.now();

  const posts: IntentPost[] = Array.from({ length: Math.min(PAGE, MAX - page * PAGE) }, (_, i) => {
    const n = page * PAGE + i;
    const rand = rng(seed + n);
    return {
      id: `demo_reddit_${n}`,
      source: "reddit",
      title: pick(TITLES, rand).replace("{biz}", biz).replace("{loc}", loc),
      excerpt: pick(EXCERPTS, rand),
      community: pick(COMMUNITIES, rand),
      author: `user_${Math.floor(rand() * 90000 + 10000)}`,
      url: "https://www.reddit.com/r/smallbusiness/",
      createdAt: new Date(now - Math.pow(rand(), 1.6) * 30 * 86_400_000).toISOString(),
      upvotes: Math.round(Math.pow(rand(), 2) * 120),
      comments: Math.round(Math.pow(rand(), 2) * 40),
    };
  });

  return {
    kind: "intent",
    source: "reddit",
    demo: true,
    posts,
    nextPageToken: (page + 1) * PAGE < MAX ? String(page + 1) : null,
  };
}
