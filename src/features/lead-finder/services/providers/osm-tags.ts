import "server-only";

/**
 * Maps our business types to OpenStreetMap tag filters (Overpass syntax).
 * Anything not listed falls back to a name match.
 */
const TAGS: { match: string[]; label: string; filters: string[] }[] = [
  { match: ["restaurant"], label: "Restaurant", filters: ['["amenity"="restaurant"]'] },
  { match: ["cafe", "coffee"], label: "Cafe", filters: ['["amenity"="cafe"]'] },
  { match: ["baker"], label: "Bakery", filters: ['["shop"="bakery"]'] },
  { match: ["barber"], label: "Barber", filters: ['["shop"="hairdresser"]["hairdresser"="barber"]', '["shop"="barber"]'] },
  { match: ["hair"], label: "Hair salon", filters: ['["shop"="hairdresser"]'] },
  { match: ["beauty", "spa", "nail"], label: "Beauty salon", filters: ['["shop"="beauty"]'] },
  { match: ["dentist", "dental"], label: "Dentist", filters: ['["amenity"="dentist"]', '["healthcare"="dentist"]'] },
  { match: ["clinic", "doctor"], label: "Clinic", filters: ['["amenity"="clinic"]', '["amenity"="doctors"]'] },
  { match: ["gym", "fitness"], label: "Gym", filters: ['["leisure"="fitness_centre"]'] },
  { match: ["plumb"], label: "Plumber", filters: ['["craft"="plumber"]'] },
  { match: ["electrician"], label: "Electrician", filters: ['["craft"="electrician"]'] },
  { match: ["ac repair", "hvac", "air condition"], label: "HVAC", filters: ['["craft"="hvac"]'] },
  { match: ["car repair", "mechanic", "garage"], label: "Car repair", filters: ['["shop"="car_repair"]'] },
  { match: ["car wash"], label: "Car wash", filters: ['["amenity"="car_wash"]'] },
  { match: ["real estate", "estate agent", "property"], label: "Real estate agent", filters: ['["office"="estate_agent"]'] },
  { match: ["tailor"], label: "Tailor", filters: ['["shop"="tailor"]', '["craft"="tailor"]'] },
  { match: ["pet"], label: "Pet shop", filters: ['["shop"="pet"]'] },
  { match: ["florist", "flower"], label: "Florist", filters: ['["shop"="florist"]'] },
  { match: ["photograph"], label: "Photographer", filters: ['["craft"="photographer"]', '["shop"="photo"]'] },
  { match: ["pharmac", "chemist"], label: "Pharmacy", filters: ['["amenity"="pharmacy"]'] },
  { match: ["hotel"], label: "Hotel", filters: ['["tourism"="hotel"]'] },
];

export function osmFiltersFor(category: string): { label: string | null; filters: string[] } {
  const q = category.toLowerCase();
  const hit = TAGS.find((t) => t.match.some((m) => q.includes(m)));
  if (hit) return { label: hit.label, filters: hit.filters };

  // Unknown type: match business names, limited to commercial features.
  const term = q
    .replace(/s\b/g, "")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim();
  const name = `["name"~"${term}",i]`;
  return {
    label: null,
    filters: ["shop", "amenity", "craft", "office"].map((k) => `["${k}"]${name}`),
  };
}
