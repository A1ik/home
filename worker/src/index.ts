import { Hono } from "hono";
import { desc } from "drizzle-orm";
import type { Env } from "./types";
import { getDb } from "./db/client";
import { gdeltEvents } from "./db/schema";

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

export default app;
