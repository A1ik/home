import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("Worker API", () => {
  it("GET /api/health returns { status: 'ok' }", async () => {
    const response = await SELF.fetch("http://localhost/api/health");
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ status: "ok" });
  });
});
