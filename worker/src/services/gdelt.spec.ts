import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchGdeltArticles,
  transformArticle,
  parseGdeltDate,
  buildGdeltUrl,
  type GdeltArticle,
} from "./gdelt";

describe("GDELT Service", () => {
  describe("buildGdeltUrl", () => {
    it("builds URL with default query", () => {
      const url = buildGdeltUrl();
      expect(url).toContain("api.gdeltproject.org");
      expect(url).toContain("mode=artlist");
      expect(url).toContain("maxrecords=50");
      expect(url).toContain("format=json");
      expect(url).toContain("sort=DateDesc");
    });

    it("builds URL with custom query", () => {
      const url = buildGdeltUrl("climate change");
      expect(url).toContain("query=climate+change");
    });
  });

  describe("parseGdeltDate", () => {
    it("parses valid GDELT date format", () => {
      expect(parseGdeltDate("20250228T120000Z")).toBe("2025-02-28");
    });

    it("parses date without time component", () => {
      expect(parseGdeltDate("20250228")).toBe("2025-02-28");
    });

    it("returns null for empty string", () => {
      expect(parseGdeltDate("")).toBeNull();
    });

    it("returns null for short string", () => {
      expect(parseGdeltDate("2025")).toBeNull();
    });
  });

  describe("transformArticle", () => {
    it("transforms GDELT article to database format", () => {
      const article: GdeltArticle = {
        url: "https://example.com/article",
        title: "Test Article",
        seendate: "20250228T120000Z",
        domain: "example.com",
        language: "English",
        sourcecountry: "United States",
      };

      const result = transformArticle(article);

      expect(result.url).toBe("https://example.com/article");
      expect(result.title).toBe("Test Article");
      expect(result.publish_date).toBe("2025-02-28");
      expect(result.snippet).toBeNull();
      expect(result.raw_json).toBe(JSON.stringify(article));
    });

    it("includes optional socialimage in raw_json", () => {
      const article: GdeltArticle = {
        url: "https://example.com/article",
        title: "Test Article",
        seendate: "20250228T120000Z",
        socialimage: "https://example.com/image.jpg",
        domain: "example.com",
        language: "English",
        sourcecountry: "United States",
      };

      const result = transformArticle(article);
      const rawJson = JSON.parse(result.raw_json!);

      expect(rawJson.socialimage).toBe("https://example.com/image.jpg");
    });
  });

  describe("fetchGdeltArticles", () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it("parses valid GDELT response", async () => {
      const mockResponse: { articles: GdeltArticle[] } = {
        articles: [
          {
            url: "https://example.com/1",
            title: "Article 1",
            seendate: "20250228T120000Z",
            domain: "example.com",
            language: "English",
            sourcecountry: "United States",
          },
          {
            url: "https://example.com/2",
            title: "Article 2",
            seendate: "20250227T100000Z",
            domain: "example.com",
            language: "English",
            sourcecountry: "United States",
          },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const articles = await fetchGdeltArticles();

      expect(articles).toHaveLength(2);
      expect(articles[0].url).toBe("https://example.com/1");
      expect(articles[1].url).toBe("https://example.com/2");
    });

    it("returns empty array on network error", async () => {
      globalThis.fetch = vi
        .fn()
        .mockRejectedValue(new TypeError("Network error"));

      const articles = await fetchGdeltArticles();

      expect(articles).toEqual([]);
    });

    it("returns empty array on HTTP error", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const articles = await fetchGdeltArticles();

      expect(articles).toEqual([]);
    });

    it("returns empty array when response has no articles", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const articles = await fetchGdeltArticles();

      expect(articles).toEqual([]);
    });

    it("returns empty array on invalid JSON", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new SyntaxError("Unexpected token")),
      });

      const articles = await fetchGdeltArticles();

      expect(articles).toEqual([]);
    });
  });
});
