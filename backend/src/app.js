import Fastify from "fastify";
import { createPool } from "./db/pool.js";
import { ApiError } from "./errors/apiError.js";
import { readEnv } from "./config/env.js";
import { createRepositories } from "./repositories/index.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { mapRoutes } from "./routes/mapRoutes.js";
import { monsterRoutes } from "./routes/monsterRoutes.js";

function toErrorResponse(code, message) {
  return {
    error: {
      code,
      message,
    },
  };
}

function registerErrorHandler(app) {
  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      reply.status(400).send(toErrorResponse("bad_request", error.message));
      return;
    }

    if (error instanceof ApiError) {
      reply.status(error.statusCode).send(toErrorResponse(error.code, error.message));
      return;
    }

    request.log.error({ err: error }, "Unhandled API error");
    reply
      .status(500)
      .send(toErrorResponse("internal_server_error", "Unexpected server failure"));
  });
}

function buildLoggerOptions(config) {
  const loggerOptions = {
    level: config?.logLevel || "info",
  };

  if (!config?.logPretty) {
    return loggerOptions;
  }

  return {
    ...loggerOptions,
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        colorize: true,
      },
    },
  };
}

export async function buildApp(options = {}) {
  const config = options.config ?? (options.repositories ? null : readEnv());
  const app = Fastify({
    logger: options.logger ?? buildLoggerOptions(config),
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
  });

  registerErrorHandler(app);

  if (options.repositories) {
    app.decorate("repositories", options.repositories);
  } else {
    const pool = options.pool ?? createPool(config);
    app.decorate("db", pool);
    app.decorate("repositories", createRepositories(pool));
    app.addHook("onClose", async () => {
      await pool.end();
    });
  }

  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(monsterRoutes, { prefix: "/api/monsters" });
  await app.register(mapRoutes, { prefix: "/api/maps" });

  return app;
}
