import { z } from "zod";
import { SOURCE_IDS, SOURCES } from "../constants/sources";

export const searchFormSchema = z
  .object({
    source: z.enum(SOURCE_IDS),
    category: z
      .string()
      .trim()
      .min(2, "Enter a business type, e.g. “Dentists”")
      .max(80, "Keep it under 80 characters"),
    location: z.string().trim().max(120, "Keep it under 120 characters"),
  })
  .superRefine((v, ctx) => {
    if (SOURCES[v.source].locationRequired && v.location.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["location"],
        message: "Enter a city or area, e.g. “Lahore”",
      });
    }
  });

export type SearchFormValues = z.infer<typeof searchFormSchema>;

/** Body accepted by POST /api/search. */
export const searchRequestSchema = z.intersection(
  searchFormSchema,
  z.object({ pageToken: z.string().max(2048).optional() }),
);

export type SearchRequest = z.infer<typeof searchRequestSchema>;
