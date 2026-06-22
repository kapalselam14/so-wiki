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

describe("GET /api/maps/:slug", () => {
  it("returns map detail with monsters found there", async () => {
    let receivedMapId;
    const repositories = createRepositories({
      mapRepository: {
        getMapBySlug: async () => ({
          id: "22222222-2222-2222-2222-222222222222",
          slug: "travia-valley",
          name: "Travia Valley",
          image_url: null,
          source_url: "https://sealonline.fandom.com/wiki/Travia_Valley",
        }),
        findMapMonsters: async (mapId) => {
          receivedMapId = mapId;
          return [
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
          ];
        },
      },
    });
    const app = await createTestApp(repositories);

    const response = await app.inject({
      method: "GET",
      url: "/api/maps/travia-valley",
    });

    expect(response.statusCode).toBe(200);
    expect(receivedMapId).toBe("22222222-2222-2222-2222-222222222222");
    expect(response.json()).toEqual({
      id: "22222222-2222-2222-2222-222222222222",
      slug: "travia-valley",
      name: "Travia Valley",
      image_url: null,
      source_url: "https://sealonline.fandom.com/wiki/Travia_Valley",
      monsters: [
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
    });
  });

  it("returns 404 for a missing map", async () => {
    const app = await createTestApp(createRepositories());

    const response = await app.inject({
      method: "GET",
      url: "/api/maps/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "not_found",
        message: "Map not found",
      },
    });
  });

  it("does not expose raw database failures", async () => {
    const repositories = createRepositories({
      mapRepository: {
        getMapBySlug: async () => {
          throw new Error("internal database failure with sensitive details");
        },
      },
    });
    const app = await createTestApp(repositories);

    const response = await app.inject({
      method: "GET",
      url: "/api/maps/travia-valley",
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
