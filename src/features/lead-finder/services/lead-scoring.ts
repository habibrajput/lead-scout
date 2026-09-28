import { SOURCES } from "../constants/sources";
import type {
  Business,
  IntentLead,
  IntentPost,
  Lead,
  LeadScore,
  LeadTier,
} from "../types/lead.types";

type Reason = LeadScore["reasons"][number];

function finalize(reasons: Reason[], maxPoints = 100): LeadScore {
  const raw = reasons.reduce((sum, r) => sum + r.points, 0);
  const score = Math.max(0, Math.min(100, Math.round((raw / maxPoints) * 100)));
  return { score, tier: tierFor(score), reasons };
}

export function tierFor(score: number): LeadTier {
  if (score >= 75) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

/**
 * How likely a business is to buy a website from us, 0–100.
 * Heuristic for now; weights live here so they're easy to tune later.
 */
export function scoreBusiness(b: Business): LeadScore {
  const reasons: Reason[] = [];
  const hasReviewData = SOURCES[b.source].hasReviewData;

  if (!b.website) reasons.push({ label: "No website", points: 40 });

  if (b.phone || b.internationalPhone) reasons.push({ label: "Phone listed", points: 15 });

  if (hasReviewData && b.reviewCount > 0) {
    // Log scale: 10 reviews ≈ 10pts, 100 ≈ 20pts (cap).
    const points = Math.min(20, Math.round(Math.log10(b.reviewCount + 1) * 10));
    reasons.push({ label: `${b.reviewCount} reviews — active customers`, points });
  }

  if (hasReviewData && b.rating != null) {
    if (b.rating >= 4) reasons.push({ label: `Rated ${b.rating.toFixed(1)}`, points: 15 });
    else if (b.rating >= 3.5) reasons.push({ label: `Rated ${b.rating.toFixed(1)}`, points: 8 });
  }

  if (b.address) reasons.push({ label: "Street address listed", points: hasReviewData ? 0 : 10 });

  if (b.status === "OPERATIONAL" || b.status == null) {
    reasons.push({ label: "Currently operating", points: 10 });
  } else {
    reasons.push({ label: "Closed", points: -60 });
  }

  // Sources without reviews can't earn those 35 points — rescale so tiers stay comparable.
  return finalize(
    reasons.filter((r) => r.points !== 0),
    hasReviewData ? 100 : 75,
  );
}

export function toLead(b: Business): Lead {
  return { ...b, lead: scoreBusiness(b) };
}

const STRONG_INTENT = /\b(need|looking for|hire|hiring|recommend|quote|build me|who built)\b/i;
const BUDGET = /(\$|₹|rs\.?|pkr|£|€)\s?\d|budget|pay\b/i;

/** How promising a "looking for a website" post is, 0–100. */
export function scoreIntent(p: IntentPost, now = Date.now()): LeadScore {
  const reasons: Reason[] = [];
  const text = `${p.title} ${p.excerpt}`;
  const ageDays = (now - new Date(p.createdAt).getTime()) / 86_400_000;

  if (ageDays <= 3) reasons.push({ label: "Posted in the last 3 days", points: 30 });
  else if (ageDays <= 14) reasons.push({ label: "Posted in the last 2 weeks", points: 20 });
  else if (ageDays <= 30) reasons.push({ label: "Posted this month", points: 10 });

  if (STRONG_INTENT.test(p.title)) reasons.push({ label: "Clear request in the title", points: 30 });
  else if (STRONG_INTENT.test(p.excerpt)) reasons.push({ label: "Asks for help in the post", points: 15 });

  if (BUDGET.test(text)) reasons.push({ label: "Mentions budget or paying", points: 20 });

  if (p.comments < 5) reasons.push({ label: "Few replies — little competition", points: 20 });
  else if (p.comments < 15) reasons.push({ label: "Some replies so far", points: 10 });

  return finalize(reasons);
}

export function toIntentLead(p: IntentPost, now?: number): IntentLead {
  return { ...p, lead: scoreIntent(p, now) };
}
