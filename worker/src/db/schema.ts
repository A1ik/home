import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const gdeltEvents = sqliteTable("gdelt_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  publish_date: text("publish_date"),
  snippet: text("snippet"),
  raw_json: text("raw_json"),
  created_at: integer("created_at").notNull().default(sql`(unixepoch())`),
});

export type GdeltEvent = typeof gdeltEvents.$inferSelect;
export type NewGdeltEvent = typeof gdeltEvents.$inferInsert;
