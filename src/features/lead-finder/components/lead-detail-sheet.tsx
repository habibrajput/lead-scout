"use client";

import { Copy, ExternalLink, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SOURCES } from "../constants/sources";
import type { Lead } from "../types/lead.types";
import { copyText } from "./lead-actions";
import { LeadScoreBadge, ScoreMeter } from "./lead-score-badge";
import { WebsiteStatus } from "./website-status";

type LeadDetailSheetProps = {
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
};

export function LeadDetailSheet({ lead, onOpenChange }: LeadDetailSheetProps) {
  return (
    <Sheet open={lead != null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        {lead && <LeadDetail lead={lead} />}
      </SheetContent>
    </Sheet>
  );
}

function LeadDetail({ lead }: { lead: Lead }) {
  const phone = lead.internationalPhone ?? lead.phone;
  const source = SOURCES[lead.source];

  return (
    <>
      <SheetHeader className="gap-2 border-b border-border p-5 pr-12">
        <div className="flex items-center gap-2">
          <LeadScoreBadge lead={lead.lead} />
          {lead.category && (
            <span className="text-xs text-muted-foreground">{lead.category}</span>
          )}
        </div>
        <SheetTitle className="text-lg font-semibold leading-snug">{lead.name}</SheetTitle>
        <SheetDescription className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {lead.address ?? "No address listed"}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
        <section aria-labelledby="contact-heading" className="flex flex-col gap-3">
          <h3 id="contact-heading" className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Contact
          </h3>
          <dl className="grid grid-cols-[6rem_1fr] gap-y-3 text-sm">
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="flex items-center gap-2">
              {phone ? (
                <>
                  <span className="font-mono tabular">{phone}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy phone number"
                    onClick={() => copyText(phone, "Phone number")}
                  >
                    <Copy aria-hidden />
                  </Button>
                </>
              ) : (
                <span className="text-muted-foreground">Not listed</span>
              )}
            </dd>
            <dt className="text-muted-foreground">Website</dt>
            <dd>
              <WebsiteStatus website={lead.website} />
            </dd>
            <dt className="text-muted-foreground">Source</dt>
            <dd>{source.label}</dd>
            <dt className="text-muted-foreground">Rating</dt>
            <dd className="flex items-center gap-1.5">
              {lead.rating != null ? (
                <>
                  <Star className="size-3.5 fill-highlight text-highlight" aria-hidden />
                  <span className="font-mono tabular">{lead.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    from {lead.reviewCount.toLocaleString()} reviews
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  {source.hasReviewData ? "No reviews yet" : `Not available on ${source.label}`}
                </span>
              )}
            </dd>
          </dl>
        </section>

        <section aria-labelledby="score-heading" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h3 id="score-heading" className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Why this score
            </h3>
            <span className="font-mono text-sm font-semibold tabular">{lead.lead.score}/100</span>
          </div>
          <ScoreMeter score={lead.lead.score} />
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {lead.lead.reasons.map((r) => (
              <li key={r.label} className="flex items-center justify-between px-3 py-2 text-sm">
                <span>{r.label}</span>
                <span
                  className={cn(
                    "font-mono text-xs font-semibold tabular",
                    r.points >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {r.points >= 0 ? `+${r.points}` : r.points}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Coming soon</p>
          <p className="mt-1 leading-relaxed">
            Save to pipeline, generate a preview website and start outreach — right from here.
          </p>
        </section>
      </div>

      <SheetFooter className="flex-row gap-2 border-t border-border p-4">
        {phone && (
          <Button
            variant="outline"
            className="h-10 flex-1"
            nativeButton={false}
            render={<a href={`tel:${phone.replace(/\s+/g, "")}`} />}
          >
            <Phone aria-hidden />
            Call
          </Button>
        )}
        {lead.listingUrl && (
          <Button
            className="h-10 flex-1"
            nativeButton={false}
            render={<a href={lead.listingUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink aria-hidden />
            {source.listingLabel}
          </Button>
        )}
      </SheetFooter>
    </>
  );
}
