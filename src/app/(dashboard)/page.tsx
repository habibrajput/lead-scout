import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { LeadFinderView } from "@/features/lead-finder/components/lead-finder-view";
import { getSourceAvailability } from "@/features/lead-finder/services/search.service";

export const metadata: Metadata = { title: "Lead finder" };

export default async function LeadFinderPage() {
  // Read API-key availability at request time, not build time.
  await connection();

  return (
    <>
      <AppHeader
        title="Lead finder"
        description="Find local businesses without a website, and people asking for one."
      />
      {/* useSearchParams needs a Suspense boundary */}
      <Suspense>
        <LeadFinderView availability={getSourceAvailability()} />
      </Suspense>
    </>
  );
}
