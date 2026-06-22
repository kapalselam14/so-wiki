import { nullableString, nullableUriString, paginationMetaSchema } from "./commonSchemas.js";

export const mapSummarySchema = {
  type: "object",
  required: ["id", "slug", "name"],
  properties: {
    id: { type: "string", format: "uuid" },
    slug: { type: "string" },
    name: { type: "string" },
    image_url: nullableUriString,
    source_url: nullableUriString,
  },
};

export const dropEntitySchema = {
  type: "object",
  required: ["id", "slug", "name"],
  properties: {
    id: { type: "string", format: "uuid" },
    slug: { type: "string" },
    name: { type: "string" },
    image_url: nullableUriString,
    source_url: nullableUriString,
  },
};

export const monsterSummarySchema = {
  type: "object",
  required: ["id", "slug", "name"],
  properties: {
    id: { type: "string", format: "uuid" },
    slug: { type: "string" },
    name: { type: "string" },
    level: { anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
    element: nullableString,
    image_url: nullableUriString,
    source_page: nullableString,
    source_url: nullableUriString,
  },
};

export const monsterDetailSchema = {
  allOf: [
    monsterSummarySchema,
    {
      type: "object",
      required: ["found_at", "drops"],
      properties: {
        found_at: {
          type: "array",
          items: mapSummarySchema,
        },
        drops: {
          type: "object",
          required: [
            "gems",
            "items",
            "quest_items",
            "weapons",
            "armors",
            "accessories",
            "b_pet_eq",
            "pets",
          ],
          properties: {
            gems: { type: "array", items: dropEntitySchema },
            items: { type: "array", items: dropEntitySchema },
            quest_items: { type: "array", items: dropEntitySchema },
            weapons: { type: "array", items: dropEntitySchema },
            armors: { type: "array", items: dropEntitySchema },
            accessories: { type: "array", items: dropEntitySchema },
            b_pet_eq: { type: "array", items: dropEntitySchema },
            pets: { type: "array", items: dropEntitySchema },
          },
        },
      },
    },
  ],
};

export const monsterListResponseSchema = {
  type: "object",
  required: ["data", "meta"],
  properties: {
    data: {
      type: "array",
      items: monsterSummarySchema,
    },
    meta: paginationMetaSchema,
  },
};

export const mapListResponseSchema = {
  type: "object",
  required: ["data", "meta"],
  properties: {
    data: {
      type: "array",
      items: mapSummarySchema,
    },
    meta: paginationMetaSchema,
  },
};

export const mapDetailSchema = {
  allOf: [
    mapSummarySchema,
    {
      type: "object",
      required: ["monsters"],
      properties: {
        monsters: {
          type: "array",
          items: monsterSummarySchema,
        }
      }
    }
  ]
}
