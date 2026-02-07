import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    project: z.string(),
    order: z.number().default(0),
    section: z.enum(["overview", "guides", "resources"]).default("guides"),
  }),
});

export const collections = { docs };
