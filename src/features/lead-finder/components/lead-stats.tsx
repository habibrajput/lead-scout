import { Building2, Flame, GlobeLock, Phone } from "lucide-react";
import type { Lead } from "../types/lead.types";

export function LeadStats({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const noWebsite = leads.filter((l) => !l.website).length;
  const hot = leads.filter((l) => !l.website && l.lead.tier === "hot").length;
  const withPhone = leads.filter((l) => !l.website && (l.phone || l.internationalPhone)).length;
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

  const stats = [
    { label: "Businesses found", value: total, hint: "in this search", icon: Building2 },
    {
      label: "Without a website",
      value: noWebsite,
      hint: `${pct(noWebsite, total)}% of results`,
      icon: GlobeLock,
      emphasis: true,
    },
    { label: "Hot leads", value: hot, hint: "score 75+, no website", icon: Flame },
    { label: "Reachable by phone", value: withPhone, hint: `${pct(withPhone, noWebsite)}% of no-website`, icon: Phone },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 data-[emphasis=true]:border-primary/30 data-[emphasis=true]:bg-accent/60"
            data-emphasis={s.emphasis ?? false}
          >
            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Icon className="size-3.5" aria-hidden />
              {s.label}
            </dt>
            <dd className="font-mono text-2xl font-semibold tabular text-foreground">{s.value}</dd>
            <dd className="text-xs text-muted-foreground">{s.hint}</dd>
          </div>
        );
      })}
    </dl>
  );
}
