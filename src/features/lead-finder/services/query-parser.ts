import { POPULAR_CATEGORIES } from "../constants/categories";
import { RATING_STEPS } from "../constants/criteria.constants";
import { SOURCES, type SourceId } from "../constants/sources";
import type { ParsedQuery, SearchCriteria } from "../types/criteria.types";
import type { LeadSort } from "../types/lead.types";

/**
 * Turns a plain-English request into search criteria, e.g.
 * "search all resturent in lahore on google maps which dont have website" →
 * { source: google, category: Restaurants, location: Lahore, website: none }.
 *
 * Rule-based on purpose: instant, free and predictable. Swap in an LLM behind
 * this same signature if clients' phrasing outgrows it.
 */
export function parseQuery(input: string): ParsedQuery {
  const out: ParsedQuery = {};
  let t = ` ${input.toLowerCase().replace(/[’`]/g, "'").replace(/[,;!?"]/g, " ")} `;

  const take = (re: RegExp, fn: (m: RegExpMatchArray) => void) => {
    const m = t.match(re);
    if (!m) return;
    fn(m);
    t = t.replace(re, " ");
  };

  // 1. Platform
  for (const [id, re] of PLATFORM_PATTERNS) {
    if (out.source) break;
    take(re, () => (out.source = id));
  }

  // 2. Website — "with or without" must be checked before plain "without".
  take(WEBSITE_ANY, () => (out.website = "any"));
  take(WEBSITE_NONE, () => (out.website ??= "none"));

  // 3. Phone
  take(PHONE, () => (out.hasPhone = true));

  // 4. Sort (before rating: "top rated" has no number)
  for (const [sort, re] of SORT_PATTERNS) take(re, () => (out.sort ??= sort));

  // 5. Minimum rating
  for (const re of RATING_PATTERNS) take(re, (m) => (out.minRating ??= snapRating(Number(m[1]))));

  // 6. Location introduced by a preposition: "in Lahore", "near DHA Phase 5"
  take(/\s(?:in|near|around|within|at)\s+([\p{L}\p{N}][\p{L}\p{N}\s.'-]*?)\s*$/u, (m) => {
    const loc = stripFiller(m[1]);
    if (loc) out.location = restoreCase(loc, input);
  });

  // 7. What's left is the business type (and maybe a bare location: "restaurants lahore")
  const words = stripFiller(t).split(" ").filter(Boolean);
  if (words.length) {
    const hit = findCategory(words);
    if (hit) {
      out.category = hit.label;
      const rest = words.filter((_, i) => i < hit.start || i >= hit.end).join(" ");
      if (rest && !out.location) out.location = restoreCase(rest, input);
    } else {
      out.category = restoreCase(words.join(" "), input);
    }
  }

  return out;
}

/** Criteria → the canonical sentence shown back in the search bar. */
export function composeQuery(c: SearchCriteria): string {
  const src = SOURCES[c.source];
  if (src.kind === "intent") {
    const what = c.category ? `${c.category.toLowerCase()} ` : "";
    return `People asking for a ${what}website${c.location ? ` in ${c.location}` : ""} on ${src.label}`;
  }

  const parts = [c.category || "Businesses"];
  if (c.location) parts.push(`in ${c.location}`);
  parts.push(`on ${src.label}`);
  let s = parts.join(" ");

  if (src.kind === "business") {
    s += c.website === "none" ? " without a website" : " with or without a website";
    if (c.hasPhone) s += ", with a phone number";
    if (src.hasReviewData && c.minRating > 0) s += `, rated ${c.minRating}+`;
  }
  return s;
}

// ---------------------------------------------------------------------------

const PLATFORM_PATTERNS: [SourceId, RegExp][] = [
  ["osm", /\s(?:on|from|via|using|in)?\s*(?:open\s*street\s*maps?|osm)\b/],
  ["google", /\s(?:on|from|via|using|in)?\s*(?:google\s*maps?|g\s*maps|google)\b/],
  ["reddit", /\s(?:on|from|via|using|in)?\s*(?:reddit|subreddits?|r\/\w+)\b/],
];

const SITE = String.raw`(?:a\s+|any\s+|an?\s+own\s+)?(?:website|web\s*site|web\s*page|site|web\s*presence)s?\b`;
const WEBSITE_ANY = new RegExp(String.raw`\s(?:with\s+or\s+without|with\/without|regardless\s+of|including\s+those\s+with)\s+${SITE}`);
const WEBSITE_NONE = new RegExp(
  String.raw`\s(?:(?:which|that|who|and)\s+)?(?:without|with\s+no|having\s+no|no|missing|lacking|lack|(?:do|does|dont|don't|doesnt|doesn't|do\s+not|does\s+not)\s+(?:have|has|own))\s+${SITE}`,
);

const PHONE = /\s(?:with|has|have|having|that\s+have|who\s+have|and)\s+(?:a\s+|an\s+)?(?:phone(?:\s+numbers?)?|contact(?:\s+numbers?)?|mobile(?:\s+numbers?)?|numbers?)\b/;

const SORT_PATTERNS: [LeadSort, RegExp][] = [
  ["reviews", /\s(?:sorted\s+by|sort\s+by|order\s+by)\s+(?:most\s+)?reviews?\b|\smost\s+reviewed\b|\smost\s+popular\b/],
  ["rating", /\s(?:sorted\s+by|sort\s+by|order\s+by)\s+(?:highest\s+)?ratings?\b|\s(?:top|best|highest)[\s-]+rated\b/],
  ["name", /\s(?:sorted\s+by|sort\s+by|order\s+by)\s+name\b|\salphabetical(?:ly)?\b/],
];

const NUM = String.raw`(\d(?:\.\d)?)`;
const RATING_PATTERNS = [
  new RegExp(String.raw`\s(?:rated|rating|ratings)\s*(?:of\s+|above\s+|over\s+|at\s+least\s+|>=?\s*)?${NUM}\s*\+?(?:\s*stars?)?`),
  new RegExp(String.raw`\s${NUM}\s*\+?\s*(?:stars?|star\s+rating|rating|rated)\b`),
];

const FILLER = new Set(
  (
    "search find get show list give fetch pull me us all the every any please can could you i we want need " +
    "looking look for of a an to some businesses business places place listings listing companies shops-only " +
    "people person asking ask asks requests request website websites site sites which that who and with from on " +
    "near nearby local area city my our there are is"
  ).split(" "),
);

function stripFiller(s: string) {
  return s
    .replace(/[^\p{L}\p{N}\s.'-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w && !FILLER.has(w))
    .join(" ")
    .trim();
}

const singular = (w: string) =>
  w.endsWith("ies") ? `${w.slice(0, -3)}y` : w.endsWith("ses") ? w.slice(0, -2) : w.replace(/s$/, "");

const CATEGORY_INDEX = POPULAR_CATEGORIES.map((label) => ({
  label,
  key: label.toLowerCase().split(" ").map(singular).join(" "),
}));

/** Best fuzzy match of a 1–3 word run against known categories (typo-tolerant). */
type CategoryHit = { label: string; start: number; end: number; score: number };

function findCategory(words: string[]): CategoryHit | null {
  let best = null as CategoryHit | null;
  for (let size = 3; size >= 1; size--) {
    for (let start = 0; start + size <= words.length; start++) {
      const phrase = words.slice(start, start + size).map(singular).join(" ");
      for (const c of CATEGORY_INDEX) {
        const dist = levenshtein(phrase, c.key);
        const allowed = c.key.length <= 4 ? 0 : c.key.length <= 7 ? 1 : 2;
        if (dist <= allowed && (!best || dist < best.score)) {
          best = { label: c.label, start, end: start + size, score: dist };
        }
      }
    }
    if (best) return best;
  }
  return null;
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

function snapRating(n: number) {
  if (!Number.isFinite(n)) return 0;
  return [...RATING_STEPS].reverse().find((s) => n >= s) ?? 0;
}

/** Use the user's own casing ("DHA Phase 5") when they typed any capitals, else title-case. */
function restoreCase(lower: string, input: string) {
  const i = input.toLowerCase().indexOf(lower);
  const original = i >= 0 ? input.slice(i, i + lower.length) : lower;
  return /\p{Lu}/u.test(original) ? original : titleCase(lower);
}

function titleCase(s: string) {
  return s.replace(/[\p{L}\p{N}][^\s-]*/gu, (w) => w[0].toUpperCase() + w.slice(1));
}
