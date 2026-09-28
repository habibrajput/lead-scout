import { Globe, GlobeLock } from "lucide-react";

export function WebsiteStatus({ website }: { website: string | null }) {
  if (!website) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
        <GlobeLock className="size-3.5" aria-hidden />
        No website
      </span>
    );
  }
  let host = website;
  try {
    host = new URL(website).hostname.replace(/^www\./, "");
  } catch {}
  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex max-w-44 items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      <Globe className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{host}</span>
    </a>
  );
}
