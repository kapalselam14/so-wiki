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

describe("GET /api/monsters/:slug", () => {
  it("returns monster detail with locations and categorized drops", async () => {
    const repositories = createRepositories({
      monsterRepository: {
        findMonsterBySlug: async () => ({
          id: "11111111-1111-1111-1111-111111111111",
          slug: "piya",
          name: "Piya",
          level: 1,
          element: "None",
          image_url: null,
          source_page: "1-15",
          source_url: "https://sealonline.fandom.com/wiki/1-15",
        }),
        findMonsterLocations: async () => [
          {
            id: "22222222-2222-2222-2222-222222222222",
            slug: "travia-valley",
            name: "Travia Valley",
            image_url: null,
            source_url: "https://sealonline.fandom.com/wiki/Travia_Valley",
          },
        ],
        findMonsterDrops: async () => [
          {
            drop_category: "items",
            id: "33333333-3333-3333-3333-333333333333",
            slug: "piya-egg-shell",
            name: "Piya Egg Shell",
            image_url: null,
            source_url: "https://sealonline.fandom.com/wiki/Piya_Egg_Shell",
          },
        ],
      },
    });
    const app = await createTestApp(repositories);

    const response = await app.inject({
      method: "GET",
      url: "/api/monsters/piya",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      slug: "piya",
      found_at: [
        {
          slug: "travia-valley",
          name: "Travia Valley",
        },
      ],
      drops: {
        items: [
          {
            slug: "piya-egg-shell",
            name: "Piya Egg Shell",
          },
        ],
        gems: [],
        quest_items: [],
        weapons: [],
        armors: [],
        accessories: [],
        b_pet_eq: [],
        pets: [],
      },
    });
  });

  it("returns 404 for a missing monster", async () => {
    const app = await createTestApp(createRepositories());

    const response = await app.inject({
      method: "GET",
      url: "/api/monsters/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "not_found",
        message: "Monster not found",
      },
    });
  });

  it("does not expose raw database failures", async () => {
    const repositories = createRepositories({
      monsterRepository: {
        findMonsterBySlug: async () => {
          throw new Error("internal database failure with sensitive details");
        },
      },
    });
    const app = await createTestApp(repositories);

    const response = await app.inject({
      method: "GET",
      url: "/api/monsters/piya",
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        code: "internal_server_error",
        message: "Unexpected server failure",
      },
    });
    expect(response.body).not.toContain("sensitive details");
  });
});
