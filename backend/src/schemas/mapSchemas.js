import { errorResponseSchema, paginationQuerySchema } from "./commonSchemas.js";
import { mapListResponseSchema, mapDetailSchema } from "./entitySchemas.js";

export const listMapsSchema = {
  querystring: {
    type: "object",
    additionalProperties: false,
    properties: {
      ...paginationQuerySchema,
      search: { type: "string", minLength: 1 },
    },
  },
  response: {
    200: mapListResponseSchema,
    400: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const getMapSchema = {
  params: {
    type : "object",
    required: ["slug"],
    properties: {
      slug: {type: "string", minLength: 1}
    },
  },
  response: {
    200: mapDetailSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  }
}
