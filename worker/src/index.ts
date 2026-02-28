import { Hono } from "hono";
import { desc } from "drizzle-orm";
import type { Env } from "./types";
import { getDb } from "./db/client";
import { gdeltEvents } from "./db/schema";
import { fetchGdeltArticles, transformArticles } from "./services/gdelt";
import { insertArticles } from "./services/database";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/api/latest", async (c) => {
  try {
    const db = getDb(c.env.DB);
    const events = await db
      .select()
      .from(gdeltEvents)
      .orderBy(desc(gdeltEvents.created_at))
      .limit(10);
    return c.json(events);
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default {
  fetch: app.fetch,
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    console.log("Starting scheduled GDELT fetch...");

    try {
      // Fetch articles from GDELT API
      const articles = await fetchGdeltArticles();
      console.log(`Fetched ${articles.length} articles from GDELT`);

      if (articles.length === 0) {
        console.log("No articles to insert");
        return;
      }

      // Transform to database format
      const dbArticles = transformArticles(articles);

      // Insert with deduplication
      const db = getDb(env.DB);
      const result = await insertArticles(db, dbArticles);

      console.log(
        `GDELT sync complete: ${result.inserted} inserted, ${result.skipped} skipped (duplicates)`
      );
    } catch (error) {
      console.error("Scheduled GDELT fetch failed:", error);
    }
  },
};
