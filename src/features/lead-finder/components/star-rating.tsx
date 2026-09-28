import { Star } from "lucide-react";

export function StarRating({ rating, count }: { rating: number | null; count: number }) {
  if (rating == null) return <span className="text-xs text-muted-foreground">No reviews</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Star className="size-3.5 fill-highlight text-highlight" aria-hidden />
      <span className="font-mono font-medium tabular">{rating.toFixed(1)}</span>
      <span className="font-mono text-xs text-muted-foreground tabular">({count.toLocaleString()})</span>
    </span>
  );
}
