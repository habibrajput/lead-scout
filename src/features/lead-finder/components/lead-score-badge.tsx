import { Flame, Snowflake, ThermometerSun } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIER_META } from "../constants/search.constants";
import type { LeadScore } from "../types/lead.types";

const TIER_STYLE = {
  hot: { icon: Flame, className: "bg-highlight/15 text-amber-800 ring-highlight/30" },
  warm: { icon: ThermometerSun, className: "bg-primary/10 text-primary ring-primary/25" },
  cold: { icon: Snowflake, className: "bg-muted text-muted-foreground ring-border" },
} as const;

export function LeadScoreBadge({ lead, className }: { lead: LeadScore; className?: string }) {
  const { icon: Icon, className: tone } = TIER_STYLE[lead.tier];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-semibold ring-1 ring-inset",
        tone,
        className,
      )}
      aria-label={`Lead score ${lead.score}, ${TIER_META[lead.tier].label}`}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="font-mono tabular">{lead.score}</span>
      <span className="font-medium">{TIER_META[lead.tier].label}</span>
    </span>
  );
}

export function ScoreMeter({ score }: { score: number }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score}
      aria-label="Lead score"
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300",
          score >= 75 ? "bg-highlight" : score >= 50 ? "bg-primary" : "bg-muted-foreground/50",
        )}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}
