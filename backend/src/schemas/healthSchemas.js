export const healthResponseSchema = {
  type: "object",
  required: ["status", "service"],
  properties: {
    status: { type: "string", const: "ok" },
    service: { type: "string" },
  },
};

export const healthSchema = {
  response: {
    200: healthResponseSchema,
  },
};
