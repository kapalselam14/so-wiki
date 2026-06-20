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

describe("GET /api/maps", () => {
  it("returns paginated map summaries", async () => {
    const repositories = createRepositories({
      mapRepository: {
        listMaps: async () => [
          {
            id: "22222222-2222-2222-2222-222222222222",
            slug: "travia-valley",
            name: "Travia Valley",
            image_url: null,
            source_url: "https://sealonline.fandom.com/wiki/Travia_Valley",
          },
        ],
        countMaps: async () => 1,
      },
    });
    const app = await createTestApp(repositories);

    const response = await app.inject({
      method: "GET",
      url: "/api/maps",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        {
          id: "22222222-2222-2222-2222-222222222222",
          slug: "travia-valley",
          name: "Travia Valley",
          image_url: null,
          source_url: "https://sealonline.fandom.com/wiki/Travia_Valley",
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

  it("rejects unsupported query parameters", async () => {
    const app = await createTestApp(createRepositories());

    const response = await app.inject({
      method: "GET",
      url: "/api/maps?element=fire",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("bad_request");
  });
});
