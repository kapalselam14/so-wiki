import { healthSchema } from "../schemas/healthSchemas.js";

export async function healthRoutes(fastify) {
  fastify.get("/health", { schema: healthSchema }, async () => {
    return {
      status: "ok",
      service: "seal-online-wiki-api",
    };
  });
}
