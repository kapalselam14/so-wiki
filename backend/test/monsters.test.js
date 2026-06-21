import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { createRepositories } from "./helpers/repositories.js";

const openApps = [];

async function createTestApp(repositories) {
  const app = await buildApp({
    logger: false,
    repositories,
  });
  openApps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(openApps.splice(0).map((app) => app.close()));
});

describe("GET /api/monsters", () => {
  it("returns paginated monster summaries", async () => {
    const repositories = createRepositories({
      monsterRepository: {
        listMonsters: async () => [
          {
            id: "11111111-1111-1111-1111-111111111111",
            slug: "piya",
            name: "Piya",
            level: 1,
            element: "None",
            image_url: null,
            source_page: "1-15",
            source_url: "https://sealonline.fandom.com/wiki/1-15",
          },
        ],
        countMonsters: async () => 1,
      },
    });
    const app = await createTestApp(repositories);

    const response = await app.inject({
      method: "GET",
      url: "/api/monsters",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          slug: "piya",
          name: "Piya",
          level: 1,
          element: "None",
          image_url: null,
          source_page: "1-15",
          source_url: "https://sealonline.fandom.com/wiki/1-15",
        },
      ],
      meta: {
        page: 1,
        page_size: 20,
        total_items: 1,
        total_pages: 1,
      },
    });
  });

  it("passes supported filters to the repository", async () => {
    let receivedQuery;
    const repositories = createRepositories({
      monsterRepository: {
        listMonsters: async (query) => {
          receivedQuery = query;
          return [];
        },
        countMonsters: async () => 0,
      },
    });
    const app = await createTestApp(repositories);

    const response = await app.inject({
      method: "GET",
      url: "/api/monsters?search=piya&element=none&level_min=1&level_max=20&map_slug=travia-valley&source_page=1-15",
    });

    expect(response.statusCode).toBe(200);
    expect(receivedQuery).toMatchObject({
      search: "piya",
      element: "none",
      level_min: 1,
      level_max: 20,
      map_slug: "travia-valley",
      source_page: "1-15",
    });
  });

  it("rejects invalid pagination", async () => {
    const app = await createTestApp(createRepositories());

    const response = await app.inject({
      method: "GET",
      url: "/api/monsters?page=0",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("bad_request");
  });

  it("rejects invalid level ranges", async () => {
    const app = await createTestApp(createRepositories());

    const response = await app.inject({
      method: "GET",
      url: "/api/monsters?level_min=30&level_max=10",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "bad_request",
        message: "level_min must be less than or equal to level_max",
      },
    });
  });
});
