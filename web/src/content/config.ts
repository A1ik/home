import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    draft: z.boolean().default(false),
    summary: z.string(),
  }),
});

export const collections = { articles };
