import { FlaskConical } from "lucide-react";
import type { SourceConfig } from "../constants/sources";

export function DemoBanner({ source }: { source: SourceConfig }) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-highlight/40 bg-highlight/10 px-4 py-3 text-sm"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
      <p className="text-foreground/90">
        <strong className="font-semibold">Demo data.</strong> These {source.label} results are
        generated. Add{" "}
        {source.envVars.map((v, i) => (
          <span key={v}>
            {i > 0 && " and "}
            <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-xs">{v}</code>
          </span>
        ))}{" "}
        to <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-xs">.env.local</code>{" "}
        for live results.
      </p>
    </div>
  );
}
