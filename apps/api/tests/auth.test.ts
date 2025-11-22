import { describe, it, expect } from "vitest";
import { buildApp } from "../src/app";

describe("Auth module", () => {
  it("should expose healthcheck", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/healthz" });
    expect(response.statusCode).toBe(200);
    const json = response.json();
    expect(json.status).toBe("ok");
  });
});

