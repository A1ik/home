import type { getDb } from "../db/client";
import { gdeltEvents, type NewGdeltEvent } from "../db/schema";

export interface InsertResult {
  inserted: number;
  skipped: number;
}

export async function insertArticles(
  db: ReturnType<typeof getDb>,
  articles: NewGdeltEvent[]
): Promise<InsertResult> {
  if (articles.length === 0) {
    return { inserted: 0, skipped: 0 };
  }

  try {
    // Get count before insert
    const beforeResult = await db
      .select({ count: gdeltEvents.id })
      .from(gdeltEvents);
    const countBefore = beforeResult.length;

    // Insert with ON CONFLICT DO NOTHING for deduplication
    await db
      .insert(gdeltEvents)
      .values(articles)
      .onConflictDoNothing({ target: gdeltEvents.url });

    // Get count after insert
    const afterResult = await db
      .select({ count: gdeltEvents.id })
      .from(gdeltEvents);
    const countAfter = afterResult.length;

    const inserted = countAfter - countBefore;
    const skipped = articles.length - inserted;

    return { inserted, skipped };
  } catch (error) {
    console.error("Database insertion error:", error);
    throw error;
  }
}
