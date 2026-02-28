import type { NewGdeltEvent } from "../db/schema";

export interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  socialimage?: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

export interface GdeltResponse {
  articles?: GdeltArticle[];
}

const GDELT_API_URL = "https://api.gdeltproject.org/api/v2/doc/doc";
const DEFAULT_QUERY = '"Artificial Intelligence" OR "Automation"';

export function buildGdeltUrl(query: string = DEFAULT_QUERY): string {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    maxrecords: "50",
    format: "json",
    sort: "DateDesc",
  });
  return `${GDELT_API_URL}?${params.toString()}`;
}

export async function fetchGdeltArticles(
  query: string = DEFAULT_QUERY
): Promise<GdeltArticle[]> {
  const url = buildGdeltUrl(query);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `GDELT API error: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data: GdeltResponse = await response.json();

    if (!data.articles || !Array.isArray(data.articles)) {
      console.log("GDELT API returned no articles");
      return [];
    }

    return data.articles;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("GDELT API returned invalid JSON:", error.message);
    } else if (error instanceof TypeError) {
      console.error("Network error fetching GDELT API:", error.message);
    } else {
      console.error("Unexpected error fetching GDELT API:", error);
    }
    return [];
  }
}

export function parseGdeltDate(seendate: string): string | null {
  // GDELT format: "20250228T120000Z"
  if (!seendate || seendate.length < 8) {
    return null;
  }

  try {
    const year = seendate.slice(0, 4);
    const month = seendate.slice(4, 6);
    const day = seendate.slice(6, 8);
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

export function transformArticle(article: GdeltArticle): NewGdeltEvent {
  return {
    url: article.url,
    title: article.title,
    publish_date: parseGdeltDate(article.seendate),
    snippet: null,
    raw_json: JSON.stringify(article),
  };
}

export function transformArticles(articles: GdeltArticle[]): NewGdeltEvent[] {
  return articles.map(transformArticle);
}
