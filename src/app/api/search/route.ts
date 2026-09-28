import { NextResponse } from "next/server";
import { searchRequestSchema } from "@/features/lead-finder/schemas/search.schema";
import { ProviderError, searchLeads } from "@/features/lead-finder/services/search.service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = searchRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid search" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await searchLeads(parsed.data));
  } catch (err) {
    if (err instanceof ProviderError) {
      console.error("[search:%s] %s (%d)", parsed.data.source, err.message, err.status);
      const status = err.status === 404 ? 404 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[search:%s] unexpected error", parsed.data.source, err);
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}
