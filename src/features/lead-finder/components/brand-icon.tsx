import type { SimpleIcon } from "simple-icons";
import { cn } from "@/lib/utils";

/** Renders a simple-icons brand glyph in its brand colour. Decorative by default. */
export function BrandIcon({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-4 shrink-0", className)}
      fill={`#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );
}
