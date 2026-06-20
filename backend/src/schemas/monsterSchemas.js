import { errorResponseSchema, paginationQuerySchema } from "./commonSchemas.js";
import { monsterDetailSchema, monsterListResponseSchema } from "./entitySchemas.js";

export const listMonstersSchema = {
  querystring: {
    type: "object",
    additionalProperties: false,
    properties: {
      ...paginationQuerySchema,
      search: { type: "string", minLength: 1 },
      element: { type: "string", minLength: 1 },
      level_min: { type: "integer", minimum: 1 },
      level_max: { type: "integer", minimum: 1 },
      map_slug: { type: "string", minLength: 1 },
      source_page: { type: "string", minLength: 1 },
    },
  },
  response: {
    200: monsterListResponseSchema,
    400: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const getMonsterSchema = {
  params: {
    type: "object",
    required: ["slug"],
    properties: {
      slug: { type: "string", minLength: 1 },
    },
  },
  response: {
    200: monsterDetailSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};
