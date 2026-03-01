import { existsSync } from "node:fs";
import { resolve } from "node:path";

export function generateSlug(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
    .replace(/-$/g, "");
}

export function getUniqueSlug(
  slug: string,
  lang: string,
  basePath: string
): string {
  const articlesDir = resolve(basePath, "src/content/articles", lang);
  if (!existsSync(resolve(articlesDir, slug))) {
    return slug;
  }
  let counter = 2;
  while (existsSync(resolve(articlesDir, `${slug}-${counter}`))) {
    counter++;
  }
  return `${slug}-${counter}`;
}
