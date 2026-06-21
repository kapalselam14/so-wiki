import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { createRepositories } from "./helpers/repositories.js";

const openApps = [];

async function createTestApp() {
  const app = await buildApp({
    logger: false,
    repositories: createRepositories(),
  });
  openApps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(openApps.splice(0).map((app) => app.close()));
});

describe("GET /api/health", () => {
  it("returns API health status", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: "seal-online-wiki-api",
    });
  });
});
