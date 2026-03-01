import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getDb } from "../../db/client";
import { gdeltEvents } from "../../db/schema";
import { generateSlug, getUniqueSlug } from "../../utils/slug";

export const prerender = false;

const VALID_LANGS = ["en", "ru", "uk"] as const;

export async function POST(context: APIContext) {
  const redirect = (path: string) => context.redirect(path, 303);

  try {
    const formData = await context.request.formData();
    const rawId = formData.get("id");
    const rawLang = formData.get("lang");

    const id = Number(rawId);
    if (!rawId || isNaN(id) || id <= 0) {
      return redirect(
        "/admin/gdelt?error=" + encodeURIComponent("Invalid record ID")
      );
    }

    const lang = String(rawLang);
    if (!VALID_LANGS.includes(lang as (typeof VALID_LANGS)[number])) {
      return redirect(
        "/admin/gdelt?error=" + encodeURIComponent("Invalid language")
      );
    }

    const d1 = context.locals.runtime.env.DB;
    const db = getDb(d1);

    const [record] = await db
      .select()
      .from(gdeltEvents)
      .where(eq(gdeltEvents.id, id))
      .limit(1);

    if (!record) {
      return redirect(
        "/admin/gdelt?error=" + encodeURIComponent("Record not found")
      );
    }

    if (record.processed === 1) {
      return redirect(
        "/admin/gdelt?error=" + encodeURIComponent("Record already processed")
      );
    }

    const baseSlug = generateSlug(record.title);
    // process.cwd() points to the web/ project root in Astro dev
    const projectRoot = process.cwd();
    const slug = getUniqueSlug(baseSlug, lang, projectRoot);

    const publishDate =
      record.publish_date || new Date().toISOString().split("T")[0];
    const summary = record.snippet || "No summary available.";

    // Escape YAML single-quote values
    const escapedTitle = record.title.replace(/'/g, "''");
    const escapedSummary = summary.replace(/'/g, "''");

    const content = `---
title: '${escapedTitle}'
language: ${lang}
publishedAt: '${publishDate}'
draft: true
summary: '${escapedSummary}'
---

Source: [${record.url}](${record.url})
`;

    const dirPath = resolve(projectRoot, "src/content/articles", lang, slug);
    await mkdir(dirPath, { recursive: true });
    await writeFile(resolve(dirPath, "index.mdoc"), content, "utf-8");

    await db
      .update(gdeltEvents)
      .set({ processed: 1 })
      .where(eq(gdeltEvents.id, id));

    return redirect("/admin/gdelt?success=promoted");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return redirect("/admin/gdelt?error=" + encodeURIComponent(message));
  }
}
