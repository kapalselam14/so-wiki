export const errorResponseSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "object",
      required: ["code", "message"],
      properties: {
        code: { type: "string" },
        message: { type: "string" },
      },
    },
  },
};

export const paginationQuerySchema = {
  page: { type: "integer", minimum: 1, default: 1 },
  page_size: { type: "integer", minimum: 1, maximum: 100, default: 20 },
};

export const paginationMetaSchema = {
  type: "object",
  required: ["page", "page_size", "total_items", "total_pages"],
  properties: {
    page: { type: "integer", minimum: 1 },
    page_size: { type: "integer", minimum: 1 },
    total_items: { type: "integer", minimum: 0 },
    total_pages: { type: "integer", minimum: 0 },
  },
};

export const nullableUriString = {
  anyOf: [{ type: "string", format: "uri" }, { type: "null" }],
};

export const nullableString = {
  anyOf: [{ type: "string" }, { type: "null" }],
};
